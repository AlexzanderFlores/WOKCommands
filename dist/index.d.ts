/// <reference types="node" />
import { Client, Guild, GuildEmoji } from "discord.js";
import { Connection } from "mongoose";
import { EventEmitter } from "events";
import CommandHandler from "./CommandHandler";
import MessageHandler from "./message-handler";
import SlashCommands from "./SlashCommands";
declare type Options = {
    commandsDir?: string;
    featureDir?: string;
    messagesPath?: string;
    showWarns?: boolean;
    dbOptions?: {};
    testServers?: string | string[];
    disabledDefaultCommands: string | string[];
};
declare class WOKCommands extends EventEmitter {
    private _client;
    private _defaultPrefix;
    private _commandsDir;
    private _featureDir;
    private _mongo;
    private _mongoConnection;
    private _displayName;
    private _prefixes;
    private _categories;
    private _hiddenCategories;
    private _color;
    private _commandHandler;
    private _featureHandler;
    private _tagPeople;
    private _showWarns;
    private _botOwner;
    private _testServers;
    private _defaultLanguage;
    private _messageHandler;
    private _slashCommand;
    private _embedMessage;
    constructor(client: Client, options: Options);
    get mongoPath(): string;
    setMongoPath(mongoPath: string): WOKCommands;
    /**
     * @deprecated Please use the messages.json file instead of this method.
     */
    setSyntaxError(syntaxError: string): WOKCommands;
    get client(): Client;
    get displayName(): string;
    setDisplayName(displayName: string): WOKCommands;
    get prefixes(): {
        [name: string]: string;
    };
    get defaultPrefix(): string;
    setDefaultPrefix(defaultPrefix: string): WOKCommands;
    getPrefix(guild: Guild | null): string;
    setPrefix(guild: Guild | null, prefix: string): WOKCommands;
    get categories(): Map<String, String | GuildEmoji>;
    get hiddenCategories(): string[];
    get color(): string;
    setColor(color: string): WOKCommands;
    getEmoji(category: string): string;
    getCategory(emoji: string): string;
    /**
     * @deprecated Please use the setCategorySettings instead of this method.
     */
    setCategoryEmoji(category: string | [{
        [key: string]: any;
    }], emoji?: string): WOKCommands;
    setCategorySettings(category: string | [{
        [key: string]: any;
    }], emoji?: string): WOKCommands;
    private isEmojiUsed;
    get commandHandler(): CommandHandler;
    get mongoConnection(): Connection | null;
    isDBConnected(): boolean;
    setTagPeople(tagPeople: boolean): WOKCommands;
    get tagPeople(): boolean;
    get showWarns(): boolean;
    get botOwner(): string[];
    setBotOwner(botOwner: string | string[]): WOKCommands;
    get testServers(): string[];
    get defaultLanguage(): string;
    setDefaultLanguage(defaultLanguage: string): WOKCommands;
    get messageHandler(): MessageHandler;
    get slashCommands(): SlashCommands;
    setEmbedMessage(embededMessage: boolean): WOKCommands;
    get embedMessages(): boolean;
}
export = WOKCommands;
