"use strict";
const discord_js_1 = require("discord.js");
module.exports = {
    description: 'Allows the bot developers to manage existing slash commands',
    category: 'Configuration',
    permissions: ['ADMINISTRATOR'],
    maxArgs: 1,
    expectedArgs: '[command-id]',
    ownerOnly: true,
    hidden: true,
    slash: 'both',
    callback: async (options) => {
        const { channel, instance, text } = options;
        const { guild } = channel;
        const { slashCommands } = instance;
        const global = await slashCommands.get();
        if (text) {
            let useGuild = true;
            try {
                global?.forEach((cmd) => {
                    if (cmd.id === text) {
                        useGuild = false;
                        throw new Error('');
                    }
                });
            }
            catch (ignored) { }
            slashCommands.delete(text, useGuild ? guild.id : undefined);
            if (useGuild) {
                return `Slash command with the ID "${text}" has been deleted from guild "${guild.id}".`;
            }
            return `Slash command with the ID "${text}" has been deleted. This may take up to 1 hour to be seen on all servers using your bot.`;
        }
        let counter = 0;
        let allSlashCommands = [];
        if (global.size) {
            global.forEach((cmd) => {
                if (cmd && cmd.name) {
                    const newString = `${cmd.name}: ${cmd.id}\n`;
                    if ((allSlashCommands[counter] || []).length + newString.length <
                        1024) {
                        allSlashCommands[counter] ??= '';
                        allSlashCommands[counter] += newString;
                    }
                    else {
                        ++counter;
                        allSlashCommands[counter] ??= '';
                        allSlashCommands[counter] += newString;
                    }
                }
            });
        }
        else {
            allSlashCommands.push('None');
        }
        const embed = new discord_js_1.MessageEmbed().addField('How to delete a slash command:', `${instance.getPrefix(guild)}slash <command-id>`);
        for (let a = 0; a < allSlashCommands.length; ++a) {
            embed.addField(`Global slash commands:${a === 0 ? '' : ' (Continued)'}`, allSlashCommands[a]);
        }
        if (guild) {
            const guildOnly = await slashCommands.get(guild.id);
            counter = 0;
            let guildOnlyCommands = [];
            if (guildOnly.size) {
                guildOnly.forEach((cmd) => {
                    if (cmd && cmd.name) {
                        const newString = `${cmd.name}: ${cmd.id}\n`;
                        if ((guildOnlyCommands[counter] || []).length + newString.length <
                            1024) {
                            guildOnlyCommands[counter] ??= '';
                            guildOnlyCommands[counter] += newString;
                        }
                        else {
                            ++counter;
                            guildOnlyCommands[counter] ??= '';
                            guildOnlyCommands[counter] += newString;
                        }
                    }
                });
            }
            else {
                guildOnlyCommands[0] = 'None';
            }
            for (let a = 0; a < guildOnlyCommands.length; ++a) {
                embed.addField(`Guild slash commands:${a === 0 ? '' : ' (Continued)'}`, guildOnlyCommands[a]);
            }
        }
        if (instance.color) {
            embed.setColor(instance.color);
        }
        return embed;
    },
};
