import { APIMessage, APIMessageContentResolvable, Client } from 'discord.js'

class SlashCommands {
  private _client: Client

  constructor(client: Client) {
    this._client = client
  }

  public async get(guildId?: string): Promise<Object[]> {
    // @ts-ignore
    const app = this._client.api.applications(this._client.user.id)
    if (guildId) {
      app.guilds(guildId)
    }

    return await app.commands.get()
  }

  public async create(
    name: string,
    description: string,
    options: Object[] = [],
    guildId?: string
  ): Promise<Object> {
    // @ts-ignore
    const app = this._client.api.applications(this._client.user.id)
    if (guildId) {
      app.guilds(guildId)
    }

    return await app.commands.post({
      data: {
        name,
        description,
        options,
      },
    })
  }

  public async delete(commandId: string, guildId?: string): Promise<Buffer> {
    // @ts-ignore
    const app = this._client.api.applications(this._client.user.id)
    if (guildId) {
      app.guilds(guildId)
    }

    return await app.commands(commandId).delete()
  }

  public getObjectFromOptions(
    options?: { name: string; value: string }[]
  ): Object {
    const args: { [key: string]: any } = {}
    if (!options) {
      return args
    }

    for (const { name, value } of options) {
      args[name] = value
    }

    return args
  }

  public async createAPIMessage(
    interaction: APIMessageContentResolvable,
    content: any
  ) {
    const { data, files } = await APIMessage.create(
      // @ts-ignore
      this._client.channels.resolve(interaction.channel_id),
      content
    )
      .resolveData()
      .resolveFiles()

    return { ...data, files }
  }
}

export = SlashCommands
