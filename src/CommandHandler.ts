import { Client, Guild } from 'discord.js'
import fs from 'fs'
import WOKCommands from '.'
import path from 'path'

import Command from './Command'
import getAllFiles from './get-all-files'
import ICommand from './interfaces/ICommand'
import disabledCommands from './models/disabled-commands'
import requiredRoles from './models/required-roles'
import permissions from './permissions'
import cooldown from './models/cooldown'

class CommandHandler {
  private _commands: Map<String, Command> = new Map()

  constructor(
    instance: WOKCommands,
    client: Client,
    dir: string,
    disabledDefaultCommands: string[]
  ) {
    // Register built in commands
    for (const [file, fileName] of getAllFiles(
      path.join(__dirname, 'commands')
    )) {
      if (disabledDefaultCommands.includes(fileName)) {
        continue
      }

      this.registerCommand(instance, client, file, fileName)
    }

    if (dir) {
      if (fs.existsSync(dir)) {
        const files = getAllFiles(dir)

        const amount = files.length
        if (amount > 0) {
          console.log(
            `WOKCommands > Loaded ${amount} command${amount === 1 ? '' : 's'}.`
          )

          for (const [file, fileName] of files) {
            this.registerCommand(instance, client, file, fileName)
          }

          client.on('message', (message) => {
            const guild: Guild | null = message.guild
            let content: string = message.content
            const prefix = instance.getPrefix(guild)

            if (content.startsWith(prefix)) {
              // Remove the prefix
              content = content.substring(prefix.length)

              const args = content.split(/ /g)

              // Remove the "command", leaving just the arguments
              const firstElement = args.shift()

              if (firstElement) {
                // Ensure the user input is lower case because it is stored as lower case in the map
                const name = firstElement.toLowerCase()

                const command = this._commands.get(name)
                if (command) {
                  if (guild) {
                    const isDisabled = command.isDisabled(guild.id)

                    if (isDisabled) {
                      message.reply(
                        instance.messageHandler.get(guild, 'DISABLED_COMMAND')
                      )
                      return
                    }
                  }

                  const { member, author: user } = message

                  const {
                    minArgs,
                    maxArgs,
                    expectedArgs,
                    requiredPermissions = [],
                    cooldown,
                    globalCooldown,
                    testOnly,
                  } = command

                  if (
                    testOnly &&
                    (!guild || !instance.testServers.includes(guild.id))
                  ) {
                    return
                  }

                  if (guild && member) {
                    for (const perm of requiredPermissions) {
                      // @ts-ignore
                      if (!member.hasPermission(perm)) {
                        message.reply(
                          instance.messageHandler.get(
                            guild,
                            'MISSING_PERMISSION',
                            {
                              PERM: perm,
                            }
                          )
                        )
                        return
                      }
                    }

                    const roles = command.getRequiredRoles(guild.id)

                    if (roles && roles.length) {
                      let hasRole = false

                      for (const role of roles) {
                        if (member.roles.cache.has(role)) {
                          hasRole = true
                          break
                        }
                      }

                      if (!hasRole) {
                        message.reply(
                          instance.messageHandler.get(guild, 'MISSING_ROLES')
                        )
                        return
                      }
                    }
                  }

                  // Are the proper number of arguments provided?
                  if (
                    (minArgs !== undefined && args.length < minArgs) ||
                    (maxArgs !== undefined &&
                      maxArgs !== -1 &&
                      args.length > maxArgs)
                  ) {
                    const syntaxError = command.syntaxError || {}
                    const { messageHandler } = instance

                    let error =
                      syntaxError[messageHandler.getLanguage(guild)] ||
                      instance.messageHandler.get(guild, 'SYNTAX_ERROR')

                    // Replace {PREFIX} with the actual prefix
                    if (error) {
                      error = error.replace(/{PREFIX}/g, prefix)
                    }

                    // Replace {COMMAND} with the name of the command that was ran
                    error = error.replace(/{COMMAND}/g, name)

                    // Replace {ARGUMENTS} with the expectedArgs property from the command
                    // If one was not provided then replace {ARGUMENTS} with an empty string
                    error = error.replace(
                      / {ARGUMENTS}/g,
                      expectedArgs ? ` ${expectedArgs}` : ''
                    )

                    // Reply with the local or global syntax error
                    message.reply(error)
                    return
                  }

                  // Check for cooldowns
                  if ((cooldown || globalCooldown) && user) {
                    const guildId = guild ? guild.id : 'dm'

                    const timeLeft = command.getCooldownSeconds(
                      guildId,
                      user.id
                    )
                    if (timeLeft) {
                      message.reply(
                        instance.messageHandler.get(guild, 'COOLDOWN', {
                          COOLDOWN: timeLeft,
                        })
                      )
                      return
                    }

                    command.setCooldown(guildId, user.id)
                  }

                  command.execute(message, args)
                }
              }
            }
          })

          // If we cannot connect to a database then ensure all cooldowns are less than 5m
          instance.on('databaseConnected', (connection, state) => {
            this._commands.forEach(async (command) => {
              const connected = state === 'Connected'
              command.verifyDatabaseCooldowns(connected)

              // Load previously used cooldowns
              if (connected) {
                await this.fetchDisabledCommands()
                await this.fetchRequiredRoles()

                const results = await cooldown.find({
                  name: command.names[0],
                  type: command.globalCooldown ? 'global' : 'per-user',
                })

                // @ts-ignore
                for (const { _id, cooldown } of results) {
                  const [name, guildId, userId] = _id.split('-')
                  command.setCooldown(guildId, userId, cooldown)
                }
              }
            })
          })
        }
      } else {
        throw new Error(`Commands directory "${dir}" doesn't exist!`)
      }
    }

    const decrementCountdown = () => {
      this._commands.forEach((command) => {
        command.decrementCooldowns()
      })

      setTimeout(decrementCountdown, 1000)
    }
    decrementCountdown()
  }

  public registerCommand(
    instance: WOKCommands,
    client: Client,
    file: string,
    fileName: string
  ) {
    const configuration = require(file)
    const {
      name = fileName,
      category,
      commands,
      aliases,
      init,
      callback,
      execute,
      run,
      description,
      requiredPermissions,
      testOnly,
    } = configuration

    let callbackCounter = 0
    if (callback) ++callbackCounter
    if (execute) ++callbackCounter
    if (run) ++callbackCounter

    if (callbackCounter > 1) {
      throw new Error(
        'Commands can have "callback", "execute", or "run" functions, but not multiple.'
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

    if (name && !names.includes(name.toLowerCase())) {
      names.unshift(name.toLowerCase())
    }

    if (requiredPermissions) {
      for (const perm of requiredPermissions) {
        if (!permissions.includes(perm)) {
          throw new Error(
            `Command located at "${file}" has an invalid permission node: "${perm}". Permissions must be all upper case and be one of the following: "${[
              ...permissions,
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

    const hasCallback = callback || execute || run

    if (hasCallback) {
      if (init) {
        init(client, instance)
      }

      const command = new Command(
        instance,
        client,
        names,
        hasCallback,
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
}

export = CommandHandler
