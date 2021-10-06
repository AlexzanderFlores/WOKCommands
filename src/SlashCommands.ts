import {
  ApplicationCommand,
  ApplicationCommandOptionData,
  Channel,
  Client,
  CommandInteraction,
  CommandInteractionOptionResolver,
  Guild,
  GuildMember,
  MessageEmbed,
  User,
} from 'discord.js'
import path from 'path'

import getAllFiles from './get-all-files'
import WOKCommands from '.'

class SlashCommands {
  private _client: Client
  private _instance: WOKCommands
  private _commandChecks: Map<String, Function> = new Map()

  constructor(instance: WOKCommands, listen: boolean, typeScript?: boolean) {
    this._instance = instance
    this._client = instance.client

    this.setUp(listen, typeScript)
  }

  private async setUp(listen: boolean, typeScript = false) {
    // Do not pass in TS here because this should always compiled to JS
    for (const [file, fileName] of getAllFiles(
      path.join(__dirname, 'command-checks')
    )) {
      this._commandChecks.set(fileName, require(file))
    }

    const replyFromCheck = async (
      reply: string | MessageEmbed | MessageEmbed[],
      interaction: CommandInteraction
    ) => {
      if (!reply) {
        return new Promise((resolve) => {
          resolve('No reply provided.')
        })
      }

      if (typeof reply === 'string') {
        return interaction.reply({
          content: reply,
          ephemeral: this._instance.ephemeral,
        })
      } else {
        let embeds = []

        if (Array.isArray(reply)) {
          embeds = reply
        } else {
          embeds.push(reply)
        }

        return interaction.reply({
          embeds,
          ephemeral: this._instance.ephemeral,
        })
      }
    }

    if (listen) {
      this._client.on('interactionCreate', async (interaction) => {
        if (!interaction.isCommand()) {
          return
        }

        const { user, commandName, options, guild, channelId } = interaction
        const member = interaction.member as GuildMember
        const channel = guild?.channels.cache.get(channelId) || null
        const command = this._instance.commandHandler.getCommand(commandName)

        if (!command) {
          interaction.reply({
            content: this._instance.messageHandler.get(
              guild,
              'INVALID_SLASH_COMMAND'
            ),
            ephemeral: this._instance.ephemeral,
          })
          return
        }

        const args: string[] = []

        options.data.forEach(({ value }) => {
          args.push(String(value))
        })

        for (const [
          checkName,
          checkFunction,
        ] of this._commandChecks.entries()) {
          if (
            !(await checkFunction(
              guild,
              command,
              this._instance,
              member,
              user,
              (reply: string | MessageEmbed) => {
                return replyFromCheck(reply, interaction)
              },
              args,
              commandName,
              channel
            ))
          ) {
            return
          }
        }

        this.invokeCommand(interaction, commandName, options, args)
      })
    }
  }

  public getCommands(guildId?: string) {
    if (guildId) {
      return this._client.guilds.cache.get(guildId)?.commands
    }

    return this._client.application?.commands
  }

  public async get(guildId?: string): Promise<Map<any, any>> {
    const commands = this.getCommands(guildId)
    if (commands) {
      // @ts-ignore
      await commands.fetch()
      return commands.cache
    }

    return new Map()
  }

  private didOptionsChange(
    command: ApplicationCommand,
    options: ApplicationCommandOptionData[]
  ): boolean {
    return (
      command.options?.filter((opt, index) => {
        return (
          opt?.required !== options[index]?.required &&
          opt?.name !== options[index]?.name &&
          opt?.options?.length !== options.length
        )
      }).length !== 0
    )
  }

  public async create(
    name: string,
    description: string,
    options: ApplicationCommandOptionData[],
    guildId?: string
  ): Promise<ApplicationCommand<{}> | undefined> {
    let commands

    if (guildId) {
      commands = this._client.guilds.cache.get(guildId)?.commands
    } else {
      commands = this._client.application?.commands
    }

    if (!commands) {
      return
    }

    // @ts-ignore
    await commands.fetch()

    const cmd = commands.cache.find(
      (cmd) => cmd.name === name
    ) as ApplicationCommand

    if (cmd) {
      const optionsChanged = this.didOptionsChange(cmd, options)

      if (
        cmd.description !== description ||
        cmd.options.length !== options.length ||
        optionsChanged
      ) {
        console.log(
          `WOKCommands > Updating${
            guildId ? ' guild' : ''
          } slash command "${name}"`
        )

        return commands?.edit(cmd.id, {
          name,
          description,
          options,
        })
      }

      return Promise.resolve(cmd)
    }

    if (commands) {
      console.log(
        `WOKCommands > Creating${
          guildId ? ' guild' : ''
        } slash command "${name}"`
      )

      const newCommand = await commands.create({
        name,
        description,
        options,
      })

      return newCommand
    }

    return Promise.resolve(undefined)
  }

  public async delete(
    commandId: string,
    guildId?: string
  ): Promise<ApplicationCommand<{}> | undefined> {
    const commands = this.getCommands(guildId)
    if (commands) {
      const cmd = commands.cache.get(commandId)
      if (cmd) {
        console.log(
          `WOKCommands > Deleting${guildId ? ' guild' : ''} slash command "${
            cmd.name
          }"`
        )

        cmd.delete()
      }
    }

    return Promise.resolve(undefined)
  }

  public async invokeCommand(
    interaction: CommandInteraction,
    commandName: string,
    options: CommandInteractionOptionResolver,
    args: string[]
  ) {
    const command = this._instance.commandHandler.getCommand(commandName)

    if (!command || !command.callback) {
      return
    }

    const reply = await command.callback({
      member: interaction.member,
      guild: interaction.guild,
      channel: interaction.channel,
      args,
      text: args.join(' '),
      client: this._client,
      instance: this._instance,
      interaction,
      options,
      user: interaction.user,
    })

    if (reply) {
      if (typeof reply === 'string') {
        interaction.reply({
          content: reply,
        })
      } else if (typeof reply === 'object') {
        if (reply.custom) {
          interaction.reply(reply)
        } else {
          let embeds = []

          if (Array.isArray(reply)) {
            embeds = reply
          } else {
            embeds.push(reply)
          }

          interaction.reply({ embeds })
        }
      }
    }
  }
}

export = SlashCommands
