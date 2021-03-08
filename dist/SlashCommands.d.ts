/// <reference types="node" />
import { APIMessageContentResolvable, Channel, Guild, GuildMember } from 'discord.js';
import WOKCommands from '.';
declare class SlashCommands {
    private _client;
    private _instance;
    constructor(instance: WOKCommands, listen?: boolean);
    get(guildId?: string): Promise<Object[]>;
    create(name: string, description: string, options?: Object[], guildId?: string): Promise<Object>;
    delete(commandId: string, guildId?: string): Promise<Buffer>;
    getObjectFromOptions(options?: {
        name: string;
        value: string;
    }[]): Object;
    getArrayFromOptions(options?: {
        name: string;
        value: string;
    }[]): string[];
    createAPIMessage(interaction: APIMessageContentResolvable, content: any): Promise<{
        files: object[] | null;
    }>;
    invokeCommand(interaction: APIMessageContentResolvable, commandName: string, options: object, member: GuildMember, guild: Guild | undefined, channel: Channel | undefined): Promise<boolean>;
}
export = SlashCommands;
