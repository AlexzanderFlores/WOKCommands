"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const languages_1 = __importDefault(require("../models/languages"));
const Events_1 = __importDefault(require("../enums/Events"));
module.exports = {
    aliases: ['lang'],
    maxArgs: 1,
    cooldown: '2s',
    expectedArgs: '[Language]',
    requiredPermissions: ['ADMINISTRATOR'],
    description: 'Displays or sets the language for this Discord server',
    category: 'Configuration',
    callback: async (options) => {
        const { message, text, instance } = options;
        const { guild } = message;
        if (!guild) {
            return;
        }
        const { messageHandler } = instance;
        if (!instance.isDBConnected()) {
            message.reply(instance.messageHandler.get(guild, 'NO_DATABASE_FOUND'));
            return;
        }
        const lang = text.toLowerCase();
        if (!lang) {
            message.reply(instance.messageHandler.get(guild, 'CURRENT_LANGUAGE', {
                LANGUAGE: instance.messageHandler.getLanguage(guild),
            }));
            return;
        }
        if (!messageHandler.languages().includes(lang)) {
            message.reply(messageHandler.get(guild, 'LANGUAGE_NOT_SUPPORTED', {
                LANGUAGE: lang,
            }));
            instance.emit(Events_1.default.LANGUAGE_NOT_SUPPORTED, message, lang);
            return;
        }
        instance.messageHandler.setLanguage(guild, lang);
        message.reply(instance.messageHandler.get(guild, 'NEW_LANGUAGE', {
            LANGUAGE: lang,
        }));
        await languages_1.default.findOneAndUpdate({
            _id: guild.id,
        }, {
            _id: guild.id,
            language: lang,
        }, {
            upsert: true,
        });
    },
};
