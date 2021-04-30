import {
  APIMessage,
  APIMessageContentResolvable,
  Channel,
  Client,
  Guild,
  GuildMember,
  MessageEmbed,
} from "discord.js";
import WOKCommands from ".";
import ISlashCommand from "./interfaces/ISlashCommand";

class SlashCommands {
  private _client: Client;
  private _instance: WOKCommands;

  constructor(instance: WOKCommands, listen = true) {
    this._instance = instance;
    this._client = instance.client;

    if (listen) {
      // @ts-ignore
      this._client.ws.on("INTERACTION_CREATE", async (interaction) => {
        const { member, data, guild_id, channel_id } = interaction;
        const { name, options } = data;

        const command = name.toLowerCase();
        const guild = this._client.guilds.cache.get(guild_id);
        const args = this.getArrayFromOptions(guild, options);
        const channel = guild?.channels.cache.get(channel_id);
        this.invokeCommand(interaction, command, args, member, guild, channel);
      });
    }
  }

  public async get(guildId?: string): Promise<ISlashCommand[]> {
    // @ts-ignore
    const app = this._client.api.applications(this._client.user.id);
    if (guildId) {
      app.guilds(guildId);
    }

    return await app.commands.get();
  }

  public async create(
    name: string,
    description: string,
    options: Object[] = [],
    guildId?: string
  ): Promise<Object> {
    // @ts-ignore
    const app = this._client.api.applications(this._client.user.id);
    if (guildId) {
      app.guilds(guildId);
    }

    return await app.commands.post({
      data: {
        name,
        description,
        options,
      },
    });
  }

  public async delete(commandId: string, guildId?: string): Promise<Buffer> {
    // @ts-ignore
    const app = this._client.api.applications(this._client.user.id);
    if (guildId) {
      app.guilds(guildId);
    }

    return await app.commands(commandId).delete();
  }

  // Checks if string is a user id, if true, returns a Guild Member object
  private getMemberIfExists(value: string, guild: any) {
    if (
      value &&
      typeof value === "string" &&
      value.startsWith("<@!") &&
      value.endsWith(">")
    ) {
      value = value.substring(3, value.length - 1);

      value = guild?.members.cache.get(value);
    }

    return value;
  }

  public getObjectFromOptions(
    guild: { members: { cache: any } },
    options?: { name: string; value: string }[]
  ): Object {
    const args: { [key: string]: any } = {};
    if (!options) {
      return args;
    }

    for (const { name, value } of options) {
      args[name] = this.getMemberIfExists(value, guild);
    }

    return args;
  }

  public getArrayFromOptions(
    guild: { members: { cache: any } } | undefined,
    options?: { name: string; value: string }[]
  ): string[] {
    const args: string[] = [];
    if (!options) {
      return args;
    }

    for (const { value } of options) {
      args.push(this.getMemberIfExists(value, guild));
    }

    return args;
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
      .resolveFiles();

    return { ...data, files };
  }

  public async invokeCommand(
    interaction: APIMessageContentResolvable,
    commandName: string,
    options: object,
    member: GuildMember,
    guild: Guild | undefined,
    channel: Channel | undefined
  ): Promise<boolean> {
    const command = this._instance.commandHandler.getCommand(commandName);

    if (!command || !command.callback) {
      return false;
    }

    let result = await command.callback({
      member,
      guild,
      channel,
      args: options,
      // @ts-ignore
      text: options.join ? options.join(" ") : "",
      client: this._client,
      instance: this._instance,
      interaction,
    });

    if (!result) {
      console.error(
        `WOKCommands > Command "${commandName}" did not return any content from it's callback function. This is required as it is a slash command.`
      );
      return false;
    }

    let data: any = {
      content: result,
    };

    // Handle embeds
    if (typeof result === "object") {
      const embed = new MessageEmbed(result);
      data = await this.createAPIMessage(interaction, embed);
    }

    // @ts-ignore
    this._client.api
      // @ts-ignore
      .interactions(interaction.id, interaction.token)
      .callback.post({
        data: {
          type: 4,
          data,
        },
      });

    return true;
  }
}

export = SlashCommands;
