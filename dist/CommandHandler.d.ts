import { Client } from 'discord.js';
import WOKCommands from '.';
import Command from './Command';
import ICommand from './interfaces/ICommand';
declare class CommandHandler {
    private _commands;
    constructor(instance: WOKCommands, client: Client, dir: string, disabledDefaultCommands: string[]);
    registerCommand(instance: WOKCommands, client: Client, file: string, fileName: string): Promise<void>;
    get commands(): ICommand[];
    getCommandsByCategory(category: string, visibleOnly?: boolean): ICommand[];
    getCommand(name: string): Command | undefined;
    getICommand(name: string): ICommand | undefined;
    fetchDisabledCommands(): Promise<void>;
    fetchRequiredRoles(): Promise<void>;
}
export = CommandHandler;
