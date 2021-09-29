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
} from 'discord.js'
import path from 'path'

import getAllFiles from './get-all-files'
import WOKCommands from '.'
import slashCommands from './models/slash-commands'

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

        this.invokeCommand(
          interaction,
          commandName,
          options,
          args,
          member,
          guild,
          channel
        )
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
      return commands.cache
    }

    return new Map()
  }

  public async create(
    name: string,
    description: string,
    options: ApplicationCommandOptionData[],
    guildId?: string
  ): Promise<ApplicationCommand<{}> | undefined> {
    if (!this._instance.isDBConnected()) {
      console.log(
        `WOKCommands > Cannot register slash command "${name}" without a database connection.`
      )
      return
    }

    // @ts-ignore
    const nameAndClient = `${name}-${this._client.user.id}`
    const query = { nameAndClient } as { [key: string]: string }
    let commands

    if (guildId) {
      commands = this._client.guilds.cache.get(guildId)?.commands
      query.guild = guildId
    } else {
      commands = this._client.application?.commands
    }

    const alreadyCreated = await slashCommands.findOne(query)
    if (alreadyCreated) {
      try {
        const cmd = (await commands?.fetch(
          alreadyCreated._id
        )) as ApplicationCommand

        if (
          cmd.description !== description ||
          cmd.options.length !== options.length
        ) {
          console.log(
            `WOKCommands > Updating${
              guildId ? ' guild' : ''
            } slash command "${name}"`
          )

          await slashCommands.findOneAndUpdate(
            {
              _id: cmd.id,
            },
            {
              description,
              options: cmd.options,
            }
          )

          return commands?.edit(cmd.id, {
            name,
            description,
            options,
          })
        }

        return Promise.resolve(cmd)
      } catch (e) {
        console.error(e)
        await slashCommands.deleteOne({ nameAndClient })
      }

      return Promise.resolve(undefined)
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

      const data = {
        _id: newCommand.id,
        nameAndClient,
        description,
        options,
      } as { [key: string]: string | object }

      if (guildId) {
        data.guild = guildId
      }

      await new slashCommands(data).save()

      return newCommand
    }

    return Promise.resolve(undefined)
  }

  public async delete(
    commandId: string,
    guildId?: string
  ): Promise<ApplicationCommand<{}> | undefined> {
    console.log(
      `WOKCommands > Deleting${guildId ? ' guild' : ''} slash command "${name}"`
    )

    const commands = this.getCommands(guildId)
    if (commands) {
      return await commands.cache.get(commandId)?.delete()
    }

    return Promise.resolve(undefined)
  }

  public async invokeCommand(
    interaction: CommandInteraction,
    commandName: string,
    options: CommandInteractionOptionResolver,
    args: string[],
    member: GuildMember,
    guild: Guild | null,
    channel: Channel | null
  ) {
    const command = this._instance.commandHandler.getCommand(commandName)

    if (!command || !command.callback) {
      return
    }

    const reply = await command.callback({
      member,
      guild,
      channel,
      args,
      text: args.join(' '),
      client: this._client,
      instance: this._instance,
      interaction,
      options,
      user: member.user,
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
