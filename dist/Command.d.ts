import { Client, Message } from 'discord.js';
import WOKCommands from '.';
import permissions from './permissions';
import ICommand from './interfaces/ICommand';
declare class Command {
    private instance;
    private client;
    private _names;
    private _category;
    private _minArgs;
    private _maxArgs;
    private _syntaxError?;
    private _expectedArgs?;
    private _description?;
    private _requiredPermissions?;
    private _requiredRoles?;
    private _callback;
    private _error;
    private _disabled;
    private _cooldownDuration;
    private _cooldownChar;
    private _cooldown;
    private _userCooldowns;
    private _globalCooldown;
    private _guildCooldowns;
    private _databaseCooldown;
    private _ownerOnly;
    private _hidden;
    private _guildOnly;
    private _testOnly;
    private _slash;
    constructor(instance: WOKCommands, client: Client, names: string[], callback: Function, error: Function, { category, minArgs, maxArgs, syntaxError, expectedArgs, description, requiredPermissions, permissions, cooldown, globalCooldown, ownerOnly, hidden, guildOnly, testOnly, slash, }: ICommand);
    execute(message: Message, args: string[]): void;
    get names(): string[];
    get category(): string;
    get minArgs(): number;
    get maxArgs(): number;
    get syntaxError(): {
        [key: string]: string;
    };
    get expectedArgs(): string | undefined;
    get description(): string | undefined;
    get requiredPermissions(): permissions | undefined;
    get cooldownDuration(): number;
    get cooldownChar(): string;
    get cooldown(): string;
    get globalCooldown(): string;
    get testOnly(): boolean;
    verifyCooldown(cooldown: string, type: string): void;
    get hidden(): boolean;
    get guildOnly(): boolean;
    verifyDatabaseCooldowns(connected: boolean): void;
    /**
     * Decrements per-user and global cooldowns
     * Deletes expired cooldowns
     */
    decrementCooldowns(): void;
    updateDatabaseCooldowns(_id: String, cooldown: number): Promise<void>;
    setCooldown(guildId: string, userId: string, customCooldown?: number): void;
    getCooldownSeconds(guildId: string, userId: string): string;
    addRequiredRole(guildId: string, roleId: string): void;
    removeRequiredRole(guildId: string, roleId: string): void;
    getRequiredRoles(guildId: string): string[];
    get callback(): Function;
    disable(guildId: string): void;
    enable(guildId: string): void;
    isDisabled(guildId: string): boolean;
    get error(): Function | null;
    get slash(): boolean | string;
}
export = Command;
