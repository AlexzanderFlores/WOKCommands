"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var discord_js_1 = require("discord.js");
var getFirstEmbed = function (message, instance) {
    var guild = message.guild, member = message.member;
    var commands = instance.commandHandler.commands, messageHandler = instance.messageHandler;
    var embed = new discord_js_1.MessageEmbed()
        .setTitle(instance.displayName + " " + messageHandler.getEmbed(guild, 'HELP_MENU', 'TITLE'))
        .setDescription(messageHandler.getEmbed(guild, 'HELP_MENU', 'SELECT_A_CATEGORY'))
        .setFooter("ID #" + message.author.id);
    if (instance.color) {
        embed.setColor(instance.color);
    }
    var categories = {};
    var isAdmin = member && member.hasPermission('ADMINISTRATOR');
    for (var _i = 0, commands_1 = commands; _i < commands_1.length; _i++) {
        var _a = commands_1[_i], category = _a.category, testOnly = _a.testOnly;
        if (!category ||
            (testOnly && guild && !instance.testServers.includes(guild.id)) ||
            (!isAdmin && instance.hiddenCategories.includes(category))) {
            continue;
        }
        if (categories[category]) {
            ++categories[category].amount;
        }
        else {
            categories[category] = {
                amount: 1,
                emoji: instance.getEmoji(category),
            };
        }
    }
    var reactions = [];
    var keys = Object.keys(categories);
    for (var a = 0; a < keys.length; ++a) {
        var key = keys[a];
        var emoji = categories[key].emoji;
        if (!emoji) {
            console.warn("WOKCommands > Category \"" + key + "\" does not have an emoji icon.");
            continue;
        }
        var visibleCommands = instance.commandHandler.getCommandsByCategory(key, true);
        var amount = visibleCommands.length;
        if (amount === 0) {
            continue;
        }
        var reaction = emoji;
        reactions.push(reaction);
        embed.setDescription(embed.description +
            ("\n\n**" + reaction + " - " + key + "** - " + amount + " command" + (amount === 1 ? '' : 's')));
    }
    return {
        embed: embed,
        reactions: reactions,
    };
};
exports.default = getFirstEmbed;
