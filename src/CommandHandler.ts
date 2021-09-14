import { Client, Guild, Message, MessageEmbed } from 'discord.js'
import fs from 'fs'
import WOKCommands from '.'
import path from 'path'

import Command from './Command'
import getAllFiles from './get-all-files'
import disabledCommands from './models/disabled-commands'
import requiredRoles from './models/required-roles'
import cooldown from './models/cooldown'
import channelCommands from './models/channel-commands'
import { permissionList } from './permissions'
import { ICommand } from '../typings'
import CommandErrors from './enums/CommandErrors'
import Events from './enums/Events'

const replyFromCheck = async (
  reply: string | MessageEmbed | MessageEmbed[],
  message: Message
) => {
  if (!reply) {
    return new Promise((resolve) => {
      resolve('No reply provided.')
    })
  }

  if (typeof reply === 'string') {
    return message.reply({
      content: reply,
    })
  } else {
    let embeds = []

    if (Array.isArray(reply)) {
      embeds = reply
    } else {
      embeds.push(reply)
    }

    return message.reply({
      embeds,
    })
  }
}

export default class CommandHandler {
  private _commands: Map<String, Command> = new Map()
  private _client: Client | null = null
  private _commandChecks: Map<String, Function> = new Map()

  constructor(
    instance: WOKCommands,
    client: Client,
    dir: string,
    disabledDefaultCommands: string[],
    typeScript = false
  ) {
    this._client = client

    // Register built in commands
    for (const [file, fileName] of getAllFiles(
      path.join(__dirname, 'commands')
    )) {
      if (disabledDefaultCommands.includes(fileName)) {
        continue
      }

      this.registerCommand(instance, client, file, fileName)
    }

    for (const [file, fileName] of getAllFiles(
      path.join(__dirname, 'command-checks')
    )) {
      this._commandChecks.set(fileName, require(file))
    }

    if (dir) {
      if (!fs.existsSync(dir)) {
        throw new Error(`Commands directory "${dir}" doesn't exist!`)
      }

      const files = getAllFiles(dir, typeScript ? '.ts' : '')
      const amount = files.length

      console.log(
        `WOKCommands > Loaded ${amount} command${amount === 1 ? '' : 's'}.`
      )

      for (const [file, fileName] of files) {
        this.registerCommand(instance, client, file, fileName)
      }

      client.on('messageCreate', async (message) => {
        const guild: Guild | null = message.guild
        let content: string = message.content
        const prefix = instance.getPrefix(guild).toLowerCase()

        if (!content.toLowerCase().startsWith(prefix)) {
          return
        }

        if (instance.ignoreBots && message.author.bot) {
          return
        }

        // Remove the prefix
        content = content.substring(prefix.length)

        const args = content.split(/[ ]+/g)

        // Remove the "command", leaving just the arguments
        const firstElement = args.shift()
        if (!firstElement) {
          return
        }

        // Ensure the user input is lower case because it is stored as lower case in the map
        const name = firstElement.toLowerCase()

        const command = this._commands.get(name)
        if (!command) {
          return
        }

        const { error, slash } = command

        if (slash === true) {
          return
        }

        const { member, author: user, channel } = message

        for (const [
          checkName,
          checkFunction,
        ] of this._commandChecks.entries()) {
          if (
            !(await checkFunction(
              guild,
              command,
              instance,
              member,
              user,
              (reply: string | MessageEmbed) => {
                return replyFromCheck(reply, message)
              },
              args,
              name,
              channel
            ))
          ) {
            return
          }
        }

        try {
          command.execute(message, args)
        } catch (e) {
          if (error) {
            error({
              error: CommandErrors.EXCEPTION,
              command,
              message,
              info: {
                error: e,
              },
            })
          } else {
            message.reply(instance.messageHandler.get(guild, 'EXCEPTION'))
            console.error(e)
          }

          instance.emit(Events.COMMAND_EXCEPTION, command, message, e)
        }
      })

      // If we cannot connect to a database then ensure all cooldowns are less than 5m
      instance.on(
        Events.DATABASE_CONNECTED,
        async (connection: any, state: string) => {
          const connected = state === 'Connected'

          if (!connected) {
            return
          }

          // Load previously used cooldowns

          await this.fetchDisabledCommands()
          await this.fetchRequiredRoles()
          await this.fetchChannelOnly()

          this._commands.forEach(async (command) => {
            command.verifyDatabaseCooldowns(connected)

            const results = await cooldown.find({
              name: command.names[0],
              type: command.globalCooldown ? 'global' : 'per-user',
            })

            // @ts-ignore
            for (const { _id, cooldown } of results) {
              const [name, guildId, userId] = _id.split('-')
              command.setCooldown(guildId, userId, cooldown)
            }
          })
        }
      )
    }

    const decrementCountdown = () => {
      this._commands.forEach((command) => {
        command.decrementCooldowns()
      })

      setTimeout(decrementCountdown, 1000)
    }
    decrementCountdown()
  }

  public async registerCommand(
    instance: WOKCommands,
    client: Client,
    file: string,
    fileName: string
  ) {
    let configuration = await import(file)

    // person is using 'export default' so we import the default instead
    if (configuration.default && Object.keys(configuration).length === 1) {
      configuration = configuration.default
    }

    const {
      name = fileName,
      category,
      commands,
      aliases,
      init,
      callback,
      run,
      execute,
      error,
      description,
      requiredPermissions,
      permissions,
      testOnly,
      slash,
      expectedArgs,
      minArgs,
      options = [],
    } = configuration

    if (run || execute) {
      throw new Error(
        `Command located at "${file}" has either a "run" or "execute" function. Please rename that function to "callback".`
      )
    }

    let names = commands || aliases || []

    if (!name && (!names || names.length === 0)) {
      throw new Error(
        `Command located at "${file}" does not have a name, commands array, or aliases array set. Please set at lease one property to specify the command name.`
      )
    }

    if (typeof names === 'string') {
      names = [names]
    }

    if (typeof name !== 'string') {
      throw new Error(
        `Command located at "${file}" does not have a string as a name.`
      )
    }

    if (name && !names.includes(name.toLowerCase())) {
      names.unshift(name.toLowerCase())
    }

    if (requiredPermissions || permissions) {
      for (const perm of requiredPermissions || permissions) {
        if (!permissionList.includes(perm)) {
          throw new Error(
            `Command located at "${file}" has an invalid permission node: "${perm}". Permissions must be all upper case and be one of the following: "${[
              ...permissionList,
            ].join('", "')}"`
          )
        }
      }
    }

    const missing = []

    if (!category) {
      missing.push('Category')
    }

    if (!description) {
      missing.push('Description')
    }

    if (missing.length && instance.showWarns) {
      console.warn(
        `WOKCommands > Command "${names[0]}" does not have the following properties: ${missing}.`
      )
    }

    if (testOnly && !instance.testServers.length) {
      console.warn(
        `WOKCommands > Command "${names[0]}" has "testOnly" set to true, but no test servers are defined.`
      )
    }

    if (slash !== undefined && typeof slash !== 'boolean' && slash !== 'both') {
      throw new Error(
        `WOKCommands > Command "${names[0]}" has a "slash" property that is not boolean "true" or string "both".`
      )
    }

    if (!slash && options.length) {
      throw new Error(
        `WOKCommands > Command "${names[0]}" has an "options" property but is not a slash command.`
      )
    }

    if (slash) {
      if (!description) {
        throw new Error(
          `WOKCommands > A description is required for command "${names[0]}" because it is a slash command.`
        )
      }

      if (minArgs !== undefined && !expectedArgs) {
        throw new Error(
          `WOKCommands > Command "${names[0]}" has "minArgs" property defined without "expectedArgs" property as a slash command.`
        )
      }

      const slashCommands = instance.slashCommands

      if (options.length) {
        for (const key in options) {
          const name = options[key].name
          let lowerCase = name.toLowerCase()

          if (name !== lowerCase && instance.showWarns) {
            console.log(
              `WOKCommands > Command "${names[0]}" has an option of "${name}". All option names must be lower case for slash commands. WOKCommands will modify this for you.`
            )
          }

          if (lowerCase.match(/\s/g)) {
            lowerCase = lowerCase.replace(/\s/g, '_')
            console.log(
              `WOKCommands > Command "${names[0]}" has an option of "${name}" with a white space in it. It is a best practice for option names to only be one word. WOKCommands will modify this for you.`
            )
          }

          options[key].name = lowerCase
        }
      } else if (expectedArgs) {
        const split = expectedArgs
          .substring(1, expectedArgs.length - 1)
          .split(/[>\]] [<\[]/)

        for (let a = 0; a < split.length; ++a) {
          const item = split[a]

          options.push({
            name: item.replace(/ /g, '-').toLowerCase(),
            description: item,
            type: 3,
            required: a < minArgs,
          })
        }
      }

      if (testOnly) {
        for (const id of instance.testServers) {
          await slashCommands.create(names[0], description, options, id)
        }
      } else {
        await slashCommands.create(names[0], description, options)
      }
    }

    if (callback) {
      if (init) {
        init(client, instance)
      }

      const command = new Command(
        instance,
        client,
        names,
        callback,
        error,
        configuration
      )

      for (const name of names) {
        // Ensure the alias is lower case because we read as lower case later on
        this._commands.set(name.toLowerCase(), command)
      }
    }
  }

  public get commands(): ICommand[] {
    const results: ICommand[] = []
    const added: string[] = []

    this._commands.forEach(
      ({
        names,
        category = '',
        description = '',
        expectedArgs = '',
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
          })

          added.push(names[0])
        }
      }
    )

    return results
  }

  public getCommandsByCategory(
    category: string,
    visibleOnly?: boolean
  ): ICommand[] {
    const results: ICommand[] = []

    for (const command of this.commands) {
      if (visibleOnly && command.hidden) {
        continue
      }

      if (command.category === category) {
        results.push(command)
      }
    }

    return results
  }

  public getCommand(name: string): Command | undefined {
    return this._commands.get(name)
  }

  public getICommand(name: string): ICommand | undefined {
    return this.commands.find((command) => command.names?.includes(name))
  }

  public async fetchDisabledCommands() {
    const results: any[] = await disabledCommands.find({})

    for (const result of results) {
      const { guildId, command } = result

      this._commands.get(command)?.disable(guildId)
    }
  }

  public async fetchRequiredRoles() {
    const results: any[] = await requiredRoles.find({})

    for (const result of results) {
      const { guildId, command, requiredRoles } = result

      const cmd = this._commands.get(command)
      if (cmd) {
        for (const roleId of requiredRoles) {
          cmd.addRequiredRole(guildId, roleId)
        }
      }
    }
  }

  public async fetchChannelOnly() {
    const results: any[] = await channelCommands.find({})

    for (const result of results) {
      const { command, guildId, channels } = result

      const cmd = this._commands.get(command)
      if (!cmd) {
        continue
      }

      const guild = this._client?.guilds.cache.get(guildId)
      if (!guild) {
        continue
      }

      cmd.setRequiredChannels(
        guild,
        command,
        channels
          .toString()
          .replace(/\"\[\]/g, '')
          .split(',')
      )
    }
  }
}
