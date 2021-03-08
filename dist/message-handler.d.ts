import { Guild } from 'discord.js';
import WOKCommands from '.';
export default class MessageHandler {
    private _instance;
    private _guildLanguages;
    private _languages;
    private _messages;
    constructor(instance: WOKCommands, messagePath: string);
    languages(): string[];
    setLanguage(guild: Guild | null, language: string): Promise<void>;
    getLanguage(guild: Guild | null): string;
    get(guild: Guild | null, messageId: string, args?: {
        [key: string]: string;
    }): string;
    getEmbed(guild: Guild | null, embedId: string, itemId: string, args?: {
        [key: string]: string;
    }): string;
}
