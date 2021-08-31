import {
  ApplicationCommand,
  ApplicationCommandOptionData,
  Channel,
  Client,
  CommandInteraction,
  CommandInteractionOptionResolver,
  Guild,
} from 'discord.js'

import WOKCommands from '.'

class SlashCommands {
  private _client: Client
  private _instance: WOKCommands

  constructor(instance: WOKCommands, listen = true) {
    this._instance = instance
    this._client = instance.client

    if (listen) {
      this._client.on('interactionCreate', async (interaction) => {
        if (!interaction.isCommand()) {
          return
        }

        const { member, commandName, options, guildId, channelId } = interaction

        const command = commandName
        const guild = this._client.guilds.cache.get(guildId || '') || null
        const channel = guild?.channels.cache.get(channelId) || null
        this.invokeCommand(
          interaction,
          command,
          options,
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
    let commands

    if (guildId) {
      commands = this._client.guilds.cache.get(guildId)?.commands
    } else {
      commands = this._client.application?.commands
    }

    if (commands) {
      return await commands.create({
        name,
        description,
        options,
      })
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
    member: any,
    guild: Guild | null,
    channel: Channel | null
  ) {
    const command = this._instance.commandHandler.getCommand(commandName)

    if (!command || !command.callback) {
      return
    }

    const args: string[] = []

    options.data.forEach(({ value }) => {
      args.push(String(value))
    })

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
