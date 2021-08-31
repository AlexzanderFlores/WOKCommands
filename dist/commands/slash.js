"use strict";
const discord_js_1 = require("discord.js");
module.exports = {
    maxArgs: 3,
    expectedArgs: '["delete"] [command ID]',
    ownerOnly: true,
    description: 'Allows the bot developers to manage existing slash commands',
    category: 'Configuration',
    hidden: true,
    callback: async (options) => {
        const { channel, instance, args } = options;
        const { guild } = channel;
        const { slashCommands } = instance;
        const global = await slashCommands.get();
        if (args.length && args[0] === 'delete') {
            const targetCommand = args[1];
            if (!targetCommand) {
                channel.send('Please specify a command ID');
                return;
            }
            let useGuild = true;
            try {
                global?.forEach((cmd) => {
                    if (cmd.id === targetCommand) {
                        useGuild = false;
                        throw new Error('');
                    }
                });
            }
            catch (ignored) { }
            slashCommands.delete(targetCommand, useGuild ? guild.id : undefined);
            if (useGuild) {
                channel.send(`Slash command with the ID "${targetCommand}" has been deleted from guild "${guild.id}"`);
            }
            else {
                channel.send(`Slash command with the ID "${targetCommand}" has been deleted. This may take up to 1 hour to be seen on all servers using your bot..`);
            }
            return;
        }
        let allSlashCommands = '';
        if (global.size) {
            global.forEach((cmd) => {
                allSlashCommands += `${cmd.name}: ${cmd.id}\n`;
            });
        }
        else {
            allSlashCommands = 'None';
        }
        const embed = new discord_js_1.MessageEmbed()
            .addField('How to delete a slash command:', `${instance.getPrefix(guild)}slash delete <command ID>`)
            .addField('List of global slash commands:', allSlashCommands);
        if (guild) {
            const guildOnly = await slashCommands.get(guild.id);
            let guildOnlyCommands = '';
            if (guildOnly.size) {
                guildOnly.forEach((cmd) => {
                    guildOnlyCommands += `${cmd.name}: ${cmd.id}\n`;
                });
            }
            else {
                guildOnlyCommands = 'None';
            }
        }
        if (instance.color) {
            embed.setColor(instance.color);
        }
        channel.send({ embeds: [embed] });
    },
};
