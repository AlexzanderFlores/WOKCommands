import { Client } from 'discord.js';
import WOKCommands from '.';
declare class FeatureHandler {
    private _features;
    constructor(client: Client, instance: WOKCommands, dir: string);
    private isEnabled;
}
export = FeatureHandler;
