import { Client, Guild } from "discord.js";
import fs from "fs";
import WOKCommands from ".";
import path from "path";

import Command from "./Command";
import getAllFiles from "./get-all-files";
import ICommand from "./interfaces/ICommand";
import disabledCommands from "./models/disabled-commands";
import requiredRoles from "./models/required-roles";
import cooldown from "./models/cooldown";
import { permissionList } from "./permissions";
import CommandErrors from "./enums/CommandErrors";
import Events from "./enums/Events";

class CommandHandler {
  private _commands: Map<string, Command> = new Map();
  constructor(
    instance: WOKCommands,
    client: Client,
    dir: string,
    disabledDefaultCommands: string[]
  ) {
    // Register built in commands
    for (const [file, fileName] of getAllFiles(
      path.join(__dirname, "commands")
    )) {
      if (disabledDefaultCommands.includes(fileName)) {
        continue;
      }

      this.registerCommand(instance, client, file, fileName);
    }

    if (dir) {
      if (!fs.existsSync(dir)) {
        throw new Error(`Commands directory "${dir}" doesn't exist!`);
      }

      const files = getAllFiles(dir);

      const amount = files.length;
      if (amount <= 0) {
        return;
      }

      console.log(
        `WOKCommands > Loaded ${amount} command${amount === 1 ? "" : "s"}.`
      );

      for (const [file, fileName] of files) {
        this.registerCommand(instance, client, file, fileName);
      }

      client.on("message", (message) => {
        const guild: Guild | null = message.guild;
        let content: string = message.content;
        const prefix = instance.getPrefix(guild);
        const startsWithEmoji=this.startsWithEmoji(content);
        console.log("startssWithemoji!!!",startsWithEmoji,content)
        if (!content.startsWith(prefix)&&!startsWithEmoji) {
          return;
        }

        if (instance.ignoreBots && message.author.bot) {
          return;
        }

        // Remove the prefix
        content = startsWithEmoji?content:content.substring(prefix.length);

        const args = content.split(/ /g);

        // Remove the "command", leaving just the arguments
        const firstElement = args.shift();
        if (!firstElement) {
          return;
        }

        // Ensure the user input is lower case because it is stored as lower case in the map
        const name = startsWithEmoji?firstElement:firstElement.toLowerCase();
        /* if(startsWithEmoji){
         let wmoji =firstElement;
            if (emoji.startsWith("<:") && emoji.endsWith(">")) {
              customEmoji = true;
              emoji = emoji.split(":")[2];
              emoji = emoji.substring(0, emoji.length - 1);

              if (customEmoji) {
                emoji = client.emojis.cache.get(emoji);
              if(!emoji){
                console.warn(
                  `WOKCommands > The Custom emoji "${name.emoji}" is invalid or not accesible by the bot.`
                );
                break;
             }
            }
          }
          this._commands.set({emoji,customEmoji}, command);
 */
        const command = this._commands.get(name);
        console.log(command, /* this._commands */)
        if (!command) {
          return;
        }
        const { error, slash } = command;

        if (slash === true) {
          return;
        }

        if (guild) {
          const isDisabled = command.isDisabled(guild.id);

          if (isDisabled) {
            if (error) {
              error({
                error: CommandErrors.COMMAND_DISABLED,
                command,
                message,
              });
            } else {
              message
                .reply(instance.messageHandler.get(guild, "DISABLED_COMMAND"))
                .then((message) => {
                  console.log(instance.del);
                  if (instance.del === -1) {
                    return;
                  }

                  setTimeout(() => {
                    message.delete();
                  }, 1000 * instance.del);
                });
            }
            return;
          }
        }

        const { member, author: user } = message;

        const {
          minArgs,
          maxArgs,
          expectedArgs,
          requiredPermissions,
          cooldown,
          globalCooldown,
          testOnly,
        } = command;

        if (testOnly && (!guild || !instance.testServers.includes(guild.id))) {
          return;
        }

        if (guild && member) {
          for (const perm of requiredPermissions || []) {
            // @ts-ignore
            if (!member.hasPermission(perm)) {
              if (error) {
                error({
                  error: CommandErrors.MISSING_PERMISSIONS,
                  command,
                  message,
                });
              } else {
                message
                  .reply(
                    instance.messageHandler.get(guild, "MISSING_PERMISSION", {
                      PERM: perm,
                    })
                  )
                  .then((message) => {
                    if (instance.del === -1) {
                      return;
                    }

                    setTimeout(() => {
                      message.delete();
                    }, 1000 * instance.del);
                  });
              }
              return;
            }
          }

          const roles = command.getRequiredRoles(guild.id);

          if (roles && roles.length) {
            const missingRoles = [];
            const missingRolesNames = [];

            for (const role of roles) {
              if (!member.roles.cache.has(role)) {
                missingRoles.push(role);
                missingRolesNames.push(guild.roles.cache.get(role)?.name);
              }
            }

            if (missingRoles.length) {
              if (error) {
                error({
                  error: CommandErrors.MISSING_ROLES,
                  command,
                  message,
                  info: {
                    missingRoles,
                  },
                });
              } else {
                message
                  .reply(
                    instance.messageHandler.get(guild, "MISSING_ROLES", {
                      ROLES: missingRolesNames.join(", "),
                    })
                  )
                  .then((message) => {
                    if (instance.del === -1) {
                      return;
                    }

                    setTimeout(() => {
                      message.delete();
                    }, 1000 * instance.del);
                  });
              }
              return;
            }
          }
        }

        // Are the proper number of arguments provided?
        if (
          (minArgs !== undefined && args.length < minArgs) ||
          (maxArgs !== undefined && maxArgs !== -1 && args.length > maxArgs)
        ) {
          const syntaxError = command.syntaxError || {};
          const { messageHandler } = instance;

          let errorMsg =
            syntaxError[messageHandler.getLanguage(guild)] ||
            instance.messageHandler.get(guild, "SYNTAX_ERROR");

          // Replace {PREFIX} with the actual prefix
          if (errorMsg) {
            errorMsg = errorMsg.replace(/{PREFIX}/g, prefix);
          }

          // Replace {COMMAND} with the name of the command that was ran
          errorMsg = errorMsg.replace(/{COMMAND}/g, name);

          // Replace {ARGUMENTS} with the expectedArgs property from the command
          // If one was not provided then replace {ARGUMENTS} with an empty string
          errorMsg = errorMsg.replace(
            / {ARGUMENTS}/g,
            expectedArgs ? ` ${expectedArgs}` : ""
          );

          if (error) {
            error({
              error: CommandErrors.INVALID_ARGUMENTS,
              command,
              message,
              info: {
                minArgs,
                maxArgs,
                length: args.length,
                errorMsg,
              },
            });
          } else {
            // Reply with the local or global syntax error
            message.reply(errorMsg);
          }
          return;
        }

        // Check for cooldowns
        if ((cooldown || globalCooldown) && user) {
          const guildId = guild ? guild.id : "dm";

          const timeLeft = command.getCooldownSeconds(guildId, user.id);
          if (timeLeft) {
            if (error) {
              error({
                error: CommandErrors.COOLDOWN,
                command,
                message,
                info: {
                  timeLeft,
                },
              });
            } else {
              message.reply(
                instance.messageHandler.get(guild, "COOLDOWN", {
                  COOLDOWN: timeLeft,
                })
              );
            }
            return;
          }

          command.setCooldown(guildId, user.id);
        }

        try {
          command.execute(message, args);
        } catch (e) {
          if (error) {
            error({
              error: CommandErrors.EXCEPTION,
              command,
              message,
              info: {
                error: e,
              },
            });
          } else {
            message.reply(instance.messageHandler.get(guild, "EXCEPTION"));
            console.error(e);
          }

          instance.emit(Events.COMMAND_EXCEPTION, command, message, e);
        }
      });

      // If we cannot connect to a database then ensure all cooldowns are less than 5m
      instance.on(Events.DATABASE_CONNECTED, (connection, state) => {
        this._commands.forEach(async (command) => {
          const connected = state === "Connected";
          command.verifyDatabaseCooldowns(connected);

          if (!connected) {
            return;
          }

          // Load previously used cooldowns

          await this.fetchDisabledCommands();
          await this.fetchRequiredRoles();

          const results = await cooldown.find({
            name: command.names[0],
            type: command.globalCooldown ? "global" : "per-user",
          });

          // @ts-ignore
          for (const { _id, cooldown } of results) {
            const [name, guildId, userId] = _id.split("-");
            command.setCooldown(guildId, userId, cooldown);
          }
        });
      });
    }

    const decrementCountdown = () => {
      this._commands.forEach((command) => {
        command.decrementCooldowns();
      });

      setTimeout(decrementCountdown, 1000);
    };
    decrementCountdown();
  }

  public async registerCommand(
    instance: WOKCommands,
    client: Client,
    file: string,
    fileName: string
  ) {
    let configuration = require(file);

    // person is using 'export default' so we import the default instead
    if (configuration.default && Object.keys(configuration).length === 1) {
      configuration = configuration.default;
    }

    const {
      name = fileName,
      category,
      commands,
      aliases,
      init,
      callback,
      execute,
      run,
      error,
      description,
      requiredPermissions,
      permissions,
      testOnly,
      slash,
      expectedArgs,
      minArgs,
    } = configuration;

    let callbackCounter = 0;
    if (callback) ++callbackCounter;
    if (execute) ++callbackCounter;
    if (run) ++callbackCounter;

    if (callbackCounter > 1) {
      throw new Error(
        'Commands can have "callback", "execute", or "run" functions, but not multiple.'
      );
    }

    let names = commands || aliases || [];

    if (!name && (!names || names.length === 0)) {
      throw new Error(
        `Command located at "${file}" does not have a name, commands array, or aliases array set. Please set at lease one property to specify the command name.`
      );
    }

    if (typeof names === "string") {
      names = [names];
    }

    if (typeof name !== "string") {
      throw new Error(
        `Command located at "${file}" does not have a string as a name.`
      );
    }

    if (name && !names.includes(name.toLowerCase())) {
      names.unshift(name.toLowerCase());
    }

    if (requiredPermissions || permissions) {
      for (const perm of requiredPermissions || permissions) {
        if (!permissionList.includes(perm)) {
          throw new Error(
            `Command located at "${file}" has an invalid permission node: "${perm}". Permissions must be all upper case and be one of the following: "${[
              ...permissionList,
            ].join('", "')}"`
          );
        }
      }
    }

    const missing = [];

    if (!category) {
      missing.push("Category");
    }

    if (!description) {
      missing.push("Description");
    }

    if (missing.length && instance.showWarns) {
      console.warn(
        `WOKCommands > Command "${names[0]}" does not have the following properties: ${missing}.`
      );
    }

    if (testOnly && !instance.testServers.length) {
      console.warn(
        `WOKCommands > Command "${names[0]}" has "testOnly" set to true, but no test servers are defined.`
      );
    }

    if (slash !== undefined && typeof slash !== "boolean" && slash !== "both") {
      throw new Error(
        `WOKCommands > Command "${names[0]}" has a "slash" property that is not boolean "true" or string "both".`
      );
    }

    if (slash) {
      if (!description) {
        throw new Error(
          `WOKCommands > A description is required for command "${names[0]}" because it is a slash command.`
        );
      }

      if (minArgs !== undefined && !expectedArgs) {
        throw new Error(
          `WOKCommands > Command "${names[0]}" has "minArgs" property defined without "expectedArgs" property as a slash command.`
        );
      }

      const slashCommands = instance.slashCommands;
      const options: object[] = [];

      if (expectedArgs) {
        const split = expectedArgs
          .substring(1, expectedArgs.length - 1)
          .split(/[>\]] [<\[]/);

        for (let a = 0; a < split.length; ++a) {
          const item = split[a];

          options.push({
            name: item.replace(/ /g, "-"),
            description: item,
            type: 3,
            required: a < minArgs,
          });
        }
      }

      if (testOnly) {
        for (const id of instance.testServers) {
          await slashCommands.create(names[0], description, options, id);
        }
      } else {
        await slashCommands.create(names[0], description, options);
      }
    }

    const hasCallback = callback || execute || run;

    if (hasCallback) {
      if (init) {
        init(client, instance);
      }

      const command = new Command(
        instance,
        client,
        names,
        hasCallback,
        error,
        configuration
      );

      for (const name of names) {
        // Ensure the alias is lower case because we read as lower case later on

        //Emojis Handler for Commands, since matching a string for an emoji is pretty complicated(regex, emojis can be multiple concatenated), we have to provide an object!!!
        if (typeof name === "object") {
          console.log("object!!!",name)
          let { emoji, customEmoji } = name;
            if(!emoji){
              break;
            }

            if (emoji.startsWith("<:") && emoji.endsWith(">")) {
              customEmoji = true;
              emoji = emoji.split(":")[2];
              emoji = emoji.substring(0, emoji.length - 1);

              if (customEmoji) {
                emoji = client.emojis.cache.get(emoji);
              if(!emoji){
                console.warn(
                  `WOKCommands > The Custom emoji "${name.emoji}" is invalid or not accesible by the bot.`
                );
                break;
             }
            }
          }
          console.log(name.emoji,emoji/*, this._commands */)
          this._commands.set(name.emoji, command);
        }else{
          this._commands.set(name.toLowerCase(), command);
        }
      }
    }
  }

  private startsWithEmoji(content:string):boolean{
    let regex=/<:(\w+):(\d+)>/g;
    let iterator=content.match(regex)||[];
    let matches=[...iterator];
    if(matches?.length>0){
      if(content.startsWith(matches[0][0])){
        let emoji={name:matches[0][1],id:matches[0][2],customEmoji:true};
        return true;
      }
    }
    //TODO: check all reserved emoji codepoints, as lised here: http://www.unicode.org/Public/emoji/12.0/ 
    //stolen from https://github.com/mathiasbynens/emoji-regex
    let emojiRegexp = /\u{1F3F4}\u{E0067}\u{E0062}(?:\u{E0077}\u{E006C}\u{E0073}|\u{E0073}\u{E0063}\u{E0074}|\u{E0065}\u{E006E}\u{E0067})\u{E007F}|(?:\u{1F9D1}\u{1F3FF}\u200D\u2764\uFE0F\u200D(?:\u{1F48B}\u200D)?\u{1F9D1}|\u{1F469}\u{1F3FF}\u200D\u{1F91D}\u200D[\u{1F468}\u{1F469}])[\u{1F3FB}-\u{1F3FE}]|(?:\u{1F9D1}\u{1F3FE}\u200D\u2764\uFE0F\u200D(?:\u{1F48B}\u200D)?\u{1F9D1}|\u{1F469}\u{1F3FE}\u200D\u{1F91D}\u200D[\u{1F468}\u{1F469}])[\u{1F3FB}-\u{1F3FD}\u{1F3FF}]|(?:\u{1F9D1}\u{1F3FD}\u200D\u2764\uFE0F\u200D(?:\u{1F48B}\u200D)?\u{1F9D1}|\u{1F469}\u{1F3FD}\u200D\u{1F91D}\u200D[\u{1F468}\u{1F469}])[\u{1F3FB}\u{1F3FC}\u{1F3FE}\u{1F3FF}]|(?:\u{1F9D1}\u{1F3FC}\u200D\u2764\uFE0F\u200D(?:\u{1F48B}\u200D)?\u{1F9D1}|\u{1F469}\u{1F3FC}\u200D\u{1F91D}\u200D[\u{1F468}\u{1F469}])[\u{1F3FB}\u{1F3FD}-\u{1F3FF}]|(?:\u{1F9D1}\u{1F3FB}\u200D\u2764\uFE0F\u200D(?:\u{1F48B}\u200D)?\u{1F9D1}|\u{1F469}\u{1F3FB}\u200D\u{1F91D}\u200D[\u{1F468}\u{1F469}])[\u{1F3FC}-\u{1F3FF}]|\u{1F468}(?:\u{1F3FB}(?:\u200D(?:\u2764\uFE0F\u200D(?:\u{1F48B}\u200D\u{1F468}[\u{1F3FB}-\u{1F3FF}]|\u{1F468}[\u{1F3FB}-\u{1F3FF}])|\u{1F91D}\u200D\u{1F468}[\u{1F3FC}-\u{1F3FF}]|[\u2695\u2696\u2708]\uFE0F|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]))?|[\u{1F3FC}-\u{1F3FF}]\u200D\u2764\uFE0F\u200D(?:\u{1F48B}\u200D\u{1F468}[\u{1F3FB}-\u{1F3FF}]|\u{1F468}[\u{1F3FB}-\u{1F3FF}])|\u200D(?:\u2764\uFE0F\u200D(?:\u{1F48B}\u200D)?\u{1F468}|[\u{1F468}\u{1F469}]\u200D(?:\u{1F466}\u200D\u{1F466}|\u{1F467}\u200D[\u{1F466}\u{1F467}])|\u{1F466}\u200D\u{1F466}|\u{1F467}\u200D[\u{1F466}\u{1F467}]|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F3FF}\u200D(?:\u{1F91D}\u200D\u{1F468}[\u{1F3FB}-\u{1F3FE}]|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F3FE}\u200D(?:\u{1F91D}\u200D\u{1F468}[\u{1F3FB}-\u{1F3FD}\u{1F3FF}]|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F3FD}\u200D(?:\u{1F91D}\u200D\u{1F468}[\u{1F3FB}\u{1F3FC}\u{1F3FE}\u{1F3FF}]|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F3FC}\u200D(?:\u{1F91D}\u200D\u{1F468}[\u{1F3FB}\u{1F3FD}-\u{1F3FF}]|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|(?:\u{1F3FF}\u200D[\u2695\u2696\u2708]|\u{1F3FE}\u200D[\u2695\u2696\u2708]|\u{1F3FD}\u200D[\u2695\u2696\u2708]|\u{1F3FC}\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])\uFE0F|\u200D(?:[\u{1F468}\u{1F469}]\u200D[\u{1F466}\u{1F467}]|[\u{1F466}\u{1F467}])|\u{1F3FF}|\u{1F3FE}|\u{1F3FD}|\u{1F3FC})?|(?:\u{1F469}(?:\u{1F3FB}\u200D\u2764\uFE0F\u200D(?:\u{1F48B}\u200D[\u{1F468}\u{1F469}]|[\u{1F468}\u{1F469}])|[\u{1F3FC}-\u{1F3FF}]\u200D\u2764\uFE0F\u200D(?:\u{1F48B}\u200D[\u{1F468}\u{1F469}]|[\u{1F468}\u{1F469}]))|\u{1F9D1}[\u{1F3FB}-\u{1F3FF}]\u200D\u{1F91D}\u200D\u{1F9D1})[\u{1F3FB}-\u{1F3FF}]|\u{1F469}\u200D\u{1F469}\u200D(?:\u{1F466}\u200D\u{1F466}|\u{1F467}\u200D[\u{1F466}\u{1F467}])|\u{1F469}(?:\u200D(?:\u2764\uFE0F\u200D(?:\u{1F48B}\u200D[\u{1F468}\u{1F469}]|[\u{1F468}\u{1F469}])|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F3FF}\u200D[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]|\u{1F3FE}\u200D[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]|\u{1F3FD}\u200D[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]|\u{1F3FC}\u200D[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]|\u{1F3FB}\u200D[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F9D1}(?:\u200D(?:\u{1F91D}\u200D\u{1F9D1}|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F384}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F3FF}\u200D[\u{1F33E}\u{1F373}\u{1F37C}\u{1F384}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]|\u{1F3FE}\u200D[\u{1F33E}\u{1F373}\u{1F37C}\u{1F384}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]|\u{1F3FD}\u200D[\u{1F33E}\u{1F373}\u{1F37C}\u{1F384}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]|\u{1F3FC}\u200D[\u{1F33E}\u{1F373}\u{1F37C}\u{1F384}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]|\u{1F3FB}\u200D[\u{1F33E}\u{1F373}\u{1F37C}\u{1F384}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F469}\u200D\u{1F466}\u200D\u{1F466}|\u{1F469}\u200D\u{1F469}\u200D[\u{1F466}\u{1F467}]|\u{1F469}\u200D\u{1F467}\u200D[\u{1F466}\u{1F467}]|(?:\u{1F441}\uFE0F\u200D\u{1F5E8}|\u{1F9D1}(?:\u{1F3FF}\u200D[\u2695\u2696\u2708]|\u{1F3FE}\u200D[\u2695\u2696\u2708]|\u{1F3FD}\u200D[\u2695\u2696\u2708]|\u{1F3FC}\u200D[\u2695\u2696\u2708]|\u{1F3FB}\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\u{1F469}(?:\u{1F3FF}\u200D[\u2695\u2696\u2708]|\u{1F3FE}\u200D[\u2695\u2696\u2708]|\u{1F3FD}\u200D[\u2695\u2696\u2708]|\u{1F3FC}\u200D[\u2695\u2696\u2708]|\u{1F3FB}\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\u{1F636}\u200D\u{1F32B}|\u{1F3F3}\uFE0F\u200D\u26A7|\u{1F43B}\u200D\u2744|(?:[\u{1F3C3}\u{1F3C4}\u{1F3CA}\u{1F46E}\u{1F470}\u{1F471}\u{1F473}\u{1F477}\u{1F481}\u{1F482}\u{1F486}\u{1F487}\u{1F645}-\u{1F647}\u{1F64B}\u{1F64D}\u{1F64E}\u{1F6A3}\u{1F6B4}-\u{1F6B6}\u{1F926}\u{1F935}\u{1F937}-\u{1F939}\u{1F93D}\u{1F93E}\u{1F9B8}\u{1F9B9}\u{1F9CD}-\u{1F9CF}\u{1F9D4}\u{1F9D6}-\u{1F9DD}][\u{1F3FB}-\u{1F3FF}]|[\u{1F46F}\u{1F93C}\u{1F9DE}\u{1F9DF}])\u200D[\u2640\u2642]|[\u26F9\u{1F3CB}\u{1F3CC}\u{1F575}][\uFE0F\u{1F3FB}-\u{1F3FF}]\u200D[\u2640\u2642]|\u{1F3F4}\u200D\u2620|[\u{1F3C3}\u{1F3C4}\u{1F3CA}\u{1F46E}\u{1F470}\u{1F471}\u{1F473}\u{1F477}\u{1F481}\u{1F482}\u{1F486}\u{1F487}\u{1F645}-\u{1F647}\u{1F64B}\u{1F64D}\u{1F64E}\u{1F6A3}\u{1F6B4}-\u{1F6B6}\u{1F926}\u{1F935}\u{1F937}-\u{1F939}\u{1F93D}\u{1F93E}\u{1F9B8}\u{1F9B9}\u{1F9CD}-\u{1F9CF}\u{1F9D4}\u{1F9D6}-\u{1F9DD}]\u200D[\u2640\u2642]|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u2600-\u2604\u260E\u2611\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26B0\u26B1\u26C8\u26CF\u26D1\u26D3\u26E9\u26F0\u26F1\u26F4\u26F7\u26F8\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u3030\u303D\u3297\u3299\u{1F170}\u{1F171}\u{1F17E}\u{1F17F}\u{1F202}\u{1F237}\u{1F321}\u{1F324}-\u{1F32C}\u{1F336}\u{1F37D}\u{1F396}\u{1F397}\u{1F399}-\u{1F39B}\u{1F39E}\u{1F39F}\u{1F3CD}\u{1F3CE}\u{1F3D4}-\u{1F3DF}\u{1F3F5}\u{1F3F7}\u{1F43F}\u{1F4FD}\u{1F549}\u{1F54A}\u{1F56F}\u{1F570}\u{1F573}\u{1F576}-\u{1F579}\u{1F587}\u{1F58A}-\u{1F58D}\u{1F5A5}\u{1F5A8}\u{1F5B1}\u{1F5B2}\u{1F5BC}\u{1F5C2}-\u{1F5C4}\u{1F5D1}-\u{1F5D3}\u{1F5DC}-\u{1F5DE}\u{1F5E1}\u{1F5E3}\u{1F5E8}\u{1F5EF}\u{1F5F3}\u{1F5FA}\u{1F6CB}\u{1F6CD}-\u{1F6CF}\u{1F6E0}-\u{1F6E5}\u{1F6E9}\u{1F6F0}\u{1F6F3}])\uFE0F|\u{1F3F3}\uFE0F\u200D\u{1F308}|\u{1F469}\u200D\u{1F467}|\u{1F469}\u200D\u{1F466}|\u{1F635}\u200D\u{1F4AB}|\u{1F62E}\u200D\u{1F4A8}|\u{1F415}\u200D\u{1F9BA}|\u{1F9D1}(?:\u{1F3FF}|\u{1F3FE}|\u{1F3FD}|\u{1F3FC}|\u{1F3FB})?|\u{1F469}(?:\u{1F3FF}|\u{1F3FE}|\u{1F3FD}|\u{1F3FC}|\u{1F3FB})?|\u{1F1FD}\u{1F1F0}|\u{1F1F6}\u{1F1E6}|\u{1F1F4}\u{1F1F2}|\u{1F408}\u200D\u2B1B|\u2764\uFE0F\u200D[\u{1F525}\u{1FA79}]|\u{1F441}\uFE0F|\u{1F3F3}\uFE0F|\u{1F1FF}[\u{1F1E6}\u{1F1F2}\u{1F1FC}]|\u{1F1FE}[\u{1F1EA}\u{1F1F9}]|\u{1F1FC}[\u{1F1EB}\u{1F1F8}]|\u{1F1FB}[\u{1F1E6}\u{1F1E8}\u{1F1EA}\u{1F1EC}\u{1F1EE}\u{1F1F3}\u{1F1FA}]|\u{1F1FA}[\u{1F1E6}\u{1F1EC}\u{1F1F2}\u{1F1F3}\u{1F1F8}\u{1F1FE}\u{1F1FF}]|\u{1F1F9}[\u{1F1E6}\u{1F1E8}\u{1F1E9}\u{1F1EB}-\u{1F1ED}\u{1F1EF}-\u{1F1F4}\u{1F1F7}\u{1F1F9}\u{1F1FB}\u{1F1FC}\u{1F1FF}]|\u{1F1F8}[\u{1F1E6}-\u{1F1EA}\u{1F1EC}-\u{1F1F4}\u{1F1F7}-\u{1F1F9}\u{1F1FB}\u{1F1FD}-\u{1F1FF}]|\u{1F1F7}[\u{1F1EA}\u{1F1F4}\u{1F1F8}\u{1F1FA}\u{1F1FC}]|\u{1F1F5}[\u{1F1E6}\u{1F1EA}-\u{1F1ED}\u{1F1F0}-\u{1F1F3}\u{1F1F7}-\u{1F1F9}\u{1F1FC}\u{1F1FE}]|\u{1F1F3}[\u{1F1E6}\u{1F1E8}\u{1F1EA}-\u{1F1EC}\u{1F1EE}\u{1F1F1}\u{1F1F4}\u{1F1F5}\u{1F1F7}\u{1F1FA}\u{1F1FF}]|\u{1F1F2}[\u{1F1E6}\u{1F1E8}-\u{1F1ED}\u{1F1F0}-\u{1F1FF}]|\u{1F1F1}[\u{1F1E6}-\u{1F1E8}\u{1F1EE}\u{1F1F0}\u{1F1F7}-\u{1F1FB}\u{1F1FE}]|\u{1F1F0}[\u{1F1EA}\u{1F1EC}-\u{1F1EE}\u{1F1F2}\u{1F1F3}\u{1F1F5}\u{1F1F7}\u{1F1FC}\u{1F1FE}\u{1F1FF}]|\u{1F1EF}[\u{1F1EA}\u{1F1F2}\u{1F1F4}\u{1F1F5}]|\u{1F1EE}[\u{1F1E8}-\u{1F1EA}\u{1F1F1}-\u{1F1F4}\u{1F1F6}-\u{1F1F9}]|\u{1F1ED}[\u{1F1F0}\u{1F1F2}\u{1F1F3}\u{1F1F7}\u{1F1F9}\u{1F1FA}]|\u{1F1EC}[\u{1F1E6}\u{1F1E7}\u{1F1E9}-\u{1F1EE}\u{1F1F1}-\u{1F1F3}\u{1F1F5}-\u{1F1FA}\u{1F1FC}\u{1F1FE}]|\u{1F1EB}[\u{1F1EE}-\u{1F1F0}\u{1F1F2}\u{1F1F4}\u{1F1F7}]|\u{1F1EA}[\u{1F1E6}\u{1F1E8}\u{1F1EA}\u{1F1EC}\u{1F1ED}\u{1F1F7}-\u{1F1FA}]|\u{1F1E9}[\u{1F1EA}\u{1F1EC}\u{1F1EF}\u{1F1F0}\u{1F1F2}\u{1F1F4}\u{1F1FF}]|\u{1F1E8}[\u{1F1E6}\u{1F1E8}\u{1F1E9}\u{1F1EB}-\u{1F1EE}\u{1F1F0}-\u{1F1F5}\u{1F1F7}\u{1F1FA}-\u{1F1FF}]|\u{1F1E7}[\u{1F1E6}\u{1F1E7}\u{1F1E9}-\u{1F1EF}\u{1F1F1}-\u{1F1F4}\u{1F1F6}-\u{1F1F9}\u{1F1FB}\u{1F1FC}\u{1F1FE}\u{1F1FF}]|\u{1F1E6}[\u{1F1E8}-\u{1F1EC}\u{1F1EE}\u{1F1F1}\u{1F1F2}\u{1F1F4}\u{1F1F6}-\u{1F1FA}\u{1F1FC}\u{1F1FD}\u{1F1FF}]|[#\*0-9]\uFE0F\u20E3|\u2764\uFE0F|[\u{1F3C3}\u{1F3C4}\u{1F3CA}\u{1F46E}\u{1F470}\u{1F471}\u{1F473}\u{1F477}\u{1F481}\u{1F482}\u{1F486}\u{1F487}\u{1F645}-\u{1F647}\u{1F64B}\u{1F64D}\u{1F64E}\u{1F6A3}\u{1F6B4}-\u{1F6B6}\u{1F926}\u{1F935}\u{1F937}-\u{1F939}\u{1F93D}\u{1F93E}\u{1F9B8}\u{1F9B9}\u{1F9CD}-\u{1F9CF}\u{1F9D4}\u{1F9D6}-\u{1F9DD}][\u{1F3FB}-\u{1F3FF}]|[\u26F9\u{1F3CB}\u{1F3CC}\u{1F575}][\uFE0F\u{1F3FB}-\u{1F3FF}]|\u{1F3F4}|[\u270A\u270B\u{1F385}\u{1F3C2}\u{1F3C7}\u{1F442}\u{1F443}\u{1F446}-\u{1F450}\u{1F466}\u{1F467}\u{1F46B}-\u{1F46D}\u{1F472}\u{1F474}-\u{1F476}\u{1F478}\u{1F47C}\u{1F483}\u{1F485}\u{1F48F}\u{1F491}\u{1F4AA}\u{1F57A}\u{1F595}\u{1F596}\u{1F64C}\u{1F64F}\u{1F6C0}\u{1F6CC}\u{1F90C}\u{1F90F}\u{1F918}-\u{1F91C}\u{1F91E}\u{1F91F}\u{1F930}-\u{1F934}\u{1F936}\u{1F977}\u{1F9B5}\u{1F9B6}\u{1F9BB}\u{1F9D2}\u{1F9D3}\u{1F9D5}][\u{1F3FB}-\u{1F3FF}]|[\u261D\u270C\u270D\u{1F574}\u{1F590}][\uFE0F\u{1F3FB}-\u{1F3FF}]|[\u270A\u270B\u{1F385}\u{1F3C2}\u{1F3C7}\u{1F408}\u{1F415}\u{1F43B}\u{1F442}\u{1F443}\u{1F446}-\u{1F450}\u{1F466}\u{1F467}\u{1F46B}-\u{1F46D}\u{1F472}\u{1F474}-\u{1F476}\u{1F478}\u{1F47C}\u{1F483}\u{1F485}\u{1F48F}\u{1F491}\u{1F4AA}\u{1F57A}\u{1F595}\u{1F596}\u{1F62E}\u{1F635}\u{1F636}\u{1F64C}\u{1F64F}\u{1F6C0}\u{1F6CC}\u{1F90C}\u{1F90F}\u{1F918}-\u{1F91C}\u{1F91E}\u{1F91F}\u{1F930}-\u{1F934}\u{1F936}\u{1F977}\u{1F9B5}\u{1F9B6}\u{1F9BB}\u{1F9D2}\u{1F9D3}\u{1F9D5}]|[\u{1F3C3}\u{1F3C4}\u{1F3CA}\u{1F46E}\u{1F470}\u{1F471}\u{1F473}\u{1F477}\u{1F481}\u{1F482}\u{1F486}\u{1F487}\u{1F645}-\u{1F647}\u{1F64B}\u{1F64D}\u{1F64E}\u{1F6A3}\u{1F6B4}-\u{1F6B6}\u{1F926}\u{1F935}\u{1F937}-\u{1F939}\u{1F93D}\u{1F93E}\u{1F9B8}\u{1F9B9}\u{1F9CD}-\u{1F9CF}\u{1F9D4}\u{1F9D6}-\u{1F9DD}]|[\u{1F46F}\u{1F93C}\u{1F9DE}\u{1F9DF}]|[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55\u{1F004}\u{1F0CF}\u{1F18E}\u{1F191}-\u{1F19A}\u{1F201}\u{1F21A}\u{1F22F}\u{1F232}-\u{1F236}\u{1F238}-\u{1F23A}\u{1F250}\u{1F251}\u{1F300}-\u{1F320}\u{1F32D}-\u{1F335}\u{1F337}-\u{1F37C}\u{1F37E}-\u{1F384}\u{1F386}-\u{1F393}\u{1F3A0}-\u{1F3C1}\u{1F3C5}\u{1F3C6}\u{1F3C8}\u{1F3C9}\u{1F3CF}-\u{1F3D3}\u{1F3E0}-\u{1F3F0}\u{1F3F8}-\u{1F407}\u{1F409}-\u{1F414}\u{1F416}-\u{1F43A}\u{1F43C}-\u{1F43E}\u{1F440}\u{1F444}\u{1F445}\u{1F451}-\u{1F465}\u{1F46A}\u{1F479}-\u{1F47B}\u{1F47D}-\u{1F480}\u{1F484}\u{1F488}-\u{1F48E}\u{1F490}\u{1F492}-\u{1F4A9}\u{1F4AB}-\u{1F4FC}\u{1F4FF}-\u{1F53D}\u{1F54B}-\u{1F54E}\u{1F550}-\u{1F567}\u{1F5A4}\u{1F5FB}-\u{1F62D}\u{1F62F}-\u{1F634}\u{1F637}-\u{1F644}\u{1F648}-\u{1F64A}\u{1F680}-\u{1F6A2}\u{1F6A4}-\u{1F6B3}\u{1F6B7}-\u{1F6BF}\u{1F6C1}-\u{1F6C5}\u{1F6D0}-\u{1F6D2}\u{1F6D5}-\u{1F6D7}\u{1F6EB}\u{1F6EC}\u{1F6F4}-\u{1F6FC}\u{1F7E0}-\u{1F7EB}\u{1F90D}\u{1F90E}\u{1F910}-\u{1F917}\u{1F91D}\u{1F920}-\u{1F925}\u{1F927}-\u{1F92F}\u{1F93A}\u{1F93F}-\u{1F945}\u{1F947}-\u{1F976}\u{1F978}\u{1F97A}-\u{1F9B4}\u{1F9B7}\u{1F9BA}\u{1F9BC}-\u{1F9CB}\u{1F9D0}\u{1F9E0}-\u{1F9FF}\u{1FA70}-\u{1FA74}\u{1FA78}-\u{1FA7A}\u{1FA80}-\u{1FA86}\u{1FA90}-\u{1FAA8}\u{1FAB0}-\u{1FAB6}\u{1FAC0}-\u{1FAC2}\u{1FAD0}-\u{1FAD6}]/gu;
    let iteratorEmojis=content.match(emojiRegexp)||[]
    let emojiMatches=[...iteratorEmojis];
    if(emojiMatches?.length>0){
      if(content.startsWith(emojiMatches[0][0])){
        let emoji={name:emojiMatches[0][1]};
        return true;
      }
    }
    return false;

  }

  public get commands(): ICommand[] {
    const results: ICommand[] = [];
    const added: string[] = [];

    this._commands.forEach(
      ({
        names,
        category = "",
        description = "",
        expectedArgs = "",
        hidden = false,
        testOnly = false,
      }) => {
        if (!added.includes(names[0])) {
          results.push({
            names: [...names],
            category,
            description,
            syntax: expectedArgs,
            hidden,
            testOnly,
          });

          added.push(names[0]);
        }
      }
    );

    return results;
  }

  public getCommandsByCategory(
    category: string,
    visibleOnly?: boolean
  ): ICommand[] {
    const results: ICommand[] = [];

    for (const command of this.commands) {
      if (visibleOnly && command.hidden) {
        continue;
      }

      if (command.category === category) {
        results.push(command);
      }
    }

    return results;
  }

  public getCommand(name: string): Command | undefined {
    return this._commands.get(name);
  }

  public getICommand(name: string): ICommand | undefined {
    return this.commands.find((command) => command.names.includes(name));
  }

  public async fetchDisabledCommands() {
    const results: any[] = await disabledCommands.find({});

    for (const result of results) {
      const { guildId, command } = result;

      this._commands.get(command)?.disable(guildId);
    }
  }

  public async fetchRequiredRoles() {
    const results: any[] = await requiredRoles.find({});

    for (const result of results) {
      const { guildId, command, requiredRoles } = result;

      const cmd = this._commands.get(command);
      if (cmd) {
        for (const roleId of requiredRoles) {
          cmd.addRequiredRole(guildId, roleId);
        }
      }
    }
  }
}

export = CommandHandler;
