"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const getFirstEmbed = (message, instance) => {
    const { guild, member } = message;
    const { commandHandler: { commands }, messageHandler, } = instance;
    const embed = new discord_js_1.MessageEmbed()
        .setTitle(`${instance.displayName} ${messageHandler.getEmbed(guild, 'HELP_MENU', 'TITLE')}`)
        .setDescription(messageHandler.getEmbed(guild, 'HELP_MENU', 'SELECT_A_CATEGORY'))
        .setFooter(`ID #${message.author?.id}`);
    if (instance.color) {
        embed.setColor(instance.color);
    }
    const categories = {};
    const isAdmin = member && member.permissions.has('ADMINISTRATOR');
    for (const { category, testOnly } of commands) {
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
    const reactions = [];
    const keys = Object.keys(categories);
    for (let a = 0; a < keys.length; ++a) {
        const key = keys[a];
        const { emoji } = categories[key];
        if (!emoji) {
            console.warn(`WOKCommands > Category "${key}" does not have an emoji icon.`);
            continue;
        }
        const visibleCommands = instance.commandHandler.getCommandsByCategory(key, true);
        const amount = visibleCommands.length;
        if (amount === 0) {
            continue;
        }
        const reaction = emoji;
        reactions.push(reaction);
        embed.setDescription(embed.description +
            `\n\n**${reaction} - ${key}** - ${amount} command${amount === 1 ? '' : 's'}`);
    }
    return {
        embed,
        reactions,
    };
};
exports.default = getFirstEmbed;
