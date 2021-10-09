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
Object.defineProperty(exports, "__esModule", { value: true });
const languages_1 = __importDefault(require("./models/languages"));
const defualtMessages = require('../messages.json');
class MessageHandler {
    _instance;
    _guildLanguages = new Map(); // <Guild ID, Language>
    _languages = [];
    _messages = {};
    constructor(instance, messagePath) {
        this._instance = instance;
        (async () => {
            this._messages = messagePath ? await Promise.resolve().then(() => __importStar(require(messagePath))) : defualtMessages;
            for (const messageId of Object.keys(this._messages)) {
                for (const language of Object.keys(this._messages[messageId])) {
                    this._languages.push(language.toLowerCase());
                }
            }
            if (!this._languages.includes(instance.defaultLanguage)) {
                throw new Error(`The current default language defined is not supported.`);
            }
            if (instance.isDBConnected()) {
                const results = await languages_1.default.find();
                // @ts-ignore
                for (const { _id: guildId, language } of results) {
                    this._guildLanguages.set(guildId, language);
                }
            }
        })();
    }
    languages() {
        return this._languages;
    }
    async setLanguage(guild, language) {
        if (guild) {
            this._guildLanguages.set(guild.id, language);
        }
    }
    getLanguage(guild) {
        if (guild) {
            const result = this._guildLanguages.get(guild.id);
            if (result) {
                return result;
            }
        }
        return this._instance.defaultLanguage;
    }
    get(guild, messageId, args = {}) {
        const language = this.getLanguage(guild);
        const translations = this._messages[messageId];
        if (!translations) {
            console.error(`WOKCommands > Could not find the correct message to send for "${messageId}"`);
            return 'Could not find the correct message to send. Please report this to the bot developer.';
        }
        let result = translations[language];
        for (const key of Object.keys(args)) {
            const expression = new RegExp(`{${key}}`, 'g');
            result = result.replace(expression, args[key]);
        }
        return result;
    }
    getEmbed(guild, embedId, itemId, args = {}) {
        const language = this.getLanguage(guild);
        const items = this._messages[embedId];
        if (!items) {
            console.error(`WOKCommands > Could not find the correct item to send for "${embedId}" -> "${itemId}"`);
            return 'Could not find the correct message to send. Please report this to the bot developer.';
        }
        const translations = items[itemId];
        if (!translations) {
            console.error(`WOKCommands > Could not find the correct message to send for "${embedId}"`);
            return 'Could not find the correct message to send. Please report this to the bot developer.';
        }
        let result = translations[language];
        for (const key of Object.keys(args)) {
            const expression = new RegExp(`{${key}}`, 'g');
            result = result.replace(expression, args[key]);
        }
        return result;
    }
}
exports.default = MessageHandler;
