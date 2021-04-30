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
  private _commands: Map<String, Command> = new Map();

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

        if (!content.startsWith(prefix)) {
          return;
        }

        if (instance.ignoreBots && message.author.bot) {
          return;
        }

        // Remove the prefix
        content = content.substring(prefix.length);

        const args = content.split(/ /g);

        // Remove the "command", leaving just the arguments
        const firstElement = args.shift();
        if (!firstElement) {
          return;
        }

        // Ensure the user input is lower case because it is stored as lower case in the map
        const name = firstElement.toLowerCase();

        const command = this._commands.get(name);
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
        this._commands.set(name.toLowerCase(), command);
      }
    }
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
