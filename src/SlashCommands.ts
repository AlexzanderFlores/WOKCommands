import {
  ApplicationCommand,
  ApplicationCommandOptionData,
  Channel,
  Client,
  CommandInteraction,
  CommandInteractionOptionResolver,
  Guild,
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

  constructor(instance: WOKCommands, listen = true) {
    this._instance = instance
    this._client = instance.client

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
          ephemeral: instance.ephemeral,
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
          ephemeral: instance.ephemeral,
        })
      }
    }

    if (listen) {
      this._client.on('interactionCreate', async (interaction) => {
        if (!interaction.isCommand()) {
          return
        }

        const { member, user, commandName, options, guild, channelId } =
          interaction
        const channel = guild?.channels.cache.get(channelId) || null
        const command = instance.commandHandler.getCommand(commandName)

        if (!command) {
          interaction.reply({
            content: instance.messageHandler.get(
              guild,
              'INVALID_SLASH_COMMAND'
            ),
            ephemeral: instance.ephemeral,
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
              instance,
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
    // @ts-ignore
    const nameAndClient = `${name}-${this._client.user.id}`
    let commands

    if (guildId) {
      commands = this._client.guilds.cache.get(guildId)?.commands
    } else {
      commands = this._client.application?.commands

      if (this._instance.isDBConnected()) {
        const alreadyCreated = await slashCommands.findOne({ nameAndClient })
        if (alreadyCreated) {
          try {
            await commands?.fetch(alreadyCreated._id)
          } catch (e) {
            await slashCommands.deleteOne({ nameAndClient })
          }
          return
        }
      }
    }

    if (commands) {
      const newCommand = await commands.create({
        name,
        description,
        options,
      })

      if (!guildId && this._instance.isDBConnected()) {
        await new slashCommands({
          _id: newCommand.id,
          nameAndClient,
        }).save()
      }

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
      return await commands.cache.get(commandId)?.delete()
    }

    return Promise.resolve(undefined)
  }

  public async invokeCommand(
    interaction: CommandInteraction,
    commandName: string,
    options: CommandInteractionOptionResolver,
    args: string[],
    member: any,
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
    })

    if (reply) {
      if (typeof reply === 'string') {
        interaction.reply({
          content: reply,
        })
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

export = SlashCommands
