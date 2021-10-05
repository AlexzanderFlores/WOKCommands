"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const get_all_files_1 = __importDefault(require("./get-all-files"));
class FeatureHandler {
    _features = new Map(); // <Feature name, Disabled GuildIDs>
    _client;
    _instance;
    constructor(client, instance, dir, typeScript = false) {
        this._client = client;
        this._instance = instance;
        this.setup(dir, typeScript);
    }
    setup = async (dir, typeScript) => {
        // Register built in features
        for (const [file, fileName] of get_all_files_1.default(path_1.default.join(__dirname, 'features'), typeScript ? '.ts' : '')) {
            this.registerFeature(require(file), fileName);
        }
        if (!dir) {
            return;
        }
        if (!fs_1.default.existsSync(dir)) {
            throw new Error(`Listeners directory "${dir}" doesn't exist!`);
        }
        const files = get_all_files_1.default(dir, typeScript ? '.ts' : '');
        const amount = files.length;
        if (amount > 0) {
            console.log(`WOKCommands > Loading ${amount} listener${amount === 1 ? '' : 's'}...`);
            for (const [file, fileName] of files) {
                const debug = `WOKCommands DEBUG > Feature "${fileName}" load time`;
                if (this._instance.debug) {
                    console.time(debug);
                }
                this.registerFeature(require(file), fileName);
                if (this._instance.debug) {
                    console.timeEnd(debug);
                }
            }
        }
        else {
            console.log(`WOKCommands > Loaded ${amount} listener${amount === 1 ? '' : 's'}.`);
        }
    };
    registerFeature = (file, fileName) => {
        let func = file;
        const { config } = file;
        if (file.default) {
            func = file.default;
        }
        let testOnly = false;
        if (config) {
            const { displayName, dbName } = config;
            if (config.testOnly) {
                testOnly = true;
            }
            const missing = [];
            if (!displayName)
                missing.push('displayName');
            if (!dbName)
                missing.push('dbName');
            if (missing.length && this._instance.showWarns) {
                console.warn(`WOKCommands > Feature "${fileName}" has a config file that doesn't contain the following properties: ${missing}`);
            }
        }
        else if (this._instance.showWarns) {
            console.warn(`WOKCommands > Feature "${fileName}" does not export a config object.`);
        }
        if (typeof func !== 'function') {
            return;
        }
        const isEnabled = (guildId) => {
            if (testOnly && !this._instance.testServers.includes(guildId)) {
                return false;
            }
            return this.isEnabled(guildId, file);
        };
        if (config && config.loadDBFirst === true) {
            console.warn(`WOKCommands > config.loadDBFirst in features is no longer required. MongoDB is now connected to before any features or commands are loaded.`);
        }
        func(this._client, this._instance, isEnabled);
    };
    isEnabled = (guildId, feature) => {
        return !(this._features.get(feature) || []).includes(guildId);
    };
}
module.exports = FeatureHandler;
