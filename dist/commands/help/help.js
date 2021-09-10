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
const discord_js_1 = require("discord.js");
const _get_first_embed_1 = __importDefault(require("./!get-first-embed"));
const _ReactionListener_1 = __importStar(require("./!ReactionListener"));
const sendHelpMenu = (message, instance) => {
    const { embed, reactions } = _get_first_embed_1.default(message, instance);
    message.channel
        .send({
        embeds: [embed],
    })
        .then((message) => {
        _ReactionListener_1.addReactions(message, reactions);
    });
};
module.exports = {
    description: "Displays this bot's commands",
    category: 'Help',
    aliases: 'commands',
    maxArgs: 1,
    expectedArgs: '[command]',
    init: (client, instance) => {
        client.on('messageReactionAdd', async (reaction, user) => {
            new _ReactionListener_1.default(instance, reaction, user);
        });
    },
    callback: (options) => {
        const { message, channel, instance, args } = options;
        const { guild } = channel;
        if (guild && !guild.me?.permissions.has('SEND_MESSAGES')) {
            console.warn(`WOKCommands > Could not send message due to no permissions in channel for ${guild.name}`);
            return;
        }
        if (guild && !guild.me?.permissions.has('ADD_REACTIONS')) {
            return instance.messageHandler.get(guild, 'NO_REACT_PERMS');
        }
        // Typical "!help" syntax for the menu
        if (args.length === 0) {
            sendHelpMenu(message, instance);
            return;
        }
        // If the user is looking for info on a specific command
        // Ex: "!help prefix"
        const arg = args.shift()?.toLowerCase();
        const command = instance.commandHandler.getICommand(arg);
        if (!command) {
            return instance.messageHandler.get(guild, 'UNKNOWN_COMMAND', {
                COMMAND: arg,
            });
        }
        const description = _ReactionListener_1.default.getHelp(command, instance, guild);
        const embed = new discord_js_1.MessageEmbed()
            .setTitle(`${instance.displayName} ${instance.messageHandler.getEmbed(guild, 'HELP_MENU', 'TITLE')} - ${arg}`)
            .setDescription(description);
        if (instance.color) {
            embed.setColor(instance.color);
        }
        return embed;
    },
};
