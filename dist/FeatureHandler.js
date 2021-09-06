"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const get_all_files_1 = __importDefault(require("./get-all-files"));
const Events_1 = __importDefault(require("./enums/Events"));
const waitingForDB = [];
class FeatureHandler {
    _features = new Map(); // <Feature name, Disabled GuildIDs>
    _client;
    _instance;
    constructor(client, instance, dir, typeScript = false) {
        this._client = client;
        this._instance = instance;
        (async () => {
            // Register built in features
            for (const [file, fileName] of get_all_files_1.default(path_1.default.join(__dirname, 'features'))) {
                this.registerFeature(await Promise.resolve().then(() => __importStar(require(file))), fileName);
            }
        })();
        if (!dir) {
            return;
        }
        if (!fs_1.default.existsSync(dir)) {
            throw new Error(`Listeners directory "${dir}" doesn't exist!`);
        }
        const files = get_all_files_1.default(dir, typeScript ? '.ts' : '');
        const amount = files.length;
        if (amount === 0) {
            return;
        }
        console.log(`WOKCommands > Loaded ${amount} listener${amount === 1 ? '' : 's'}.`);
        (async () => {
            for (const [file, fileName] of files) {
                this.registerFeature(await Promise.resolve().then(() => __importStar(require(file))), fileName);
            }
            instance.on(Events_1.default.DATABASE_CONNECTED, (connection, state) => {
                if (state === 'Connected') {
                    for (const { func, client, instance, isEnabled } of waitingForDB) {
                        func(client, instance, isEnabled);
                    }
                }
            });
        })();
    }
    registerFeature = (file, fileName) => {
        const { default: func, config } = file;
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
            waitingForDB.push({
                func,
                client: this._client,
                instance: this._instance,
                isEnabled,
            });
            return;
        }
        func(this._client, this._instance, isEnabled);
    };
    isEnabled = (guildId, feature) => {
        return !(this._features.get(feature) || []).includes(guildId);
    };
}
module.exports = FeatureHandler;
