"use strict";
module.exports = {
    aliases: ['requiredroles', 'requirerole', 'requireroles'],
    minArgs: 2,
    maxArgs: 2,
    expectedArgs: '<Command Name> <"none" | Tagged Role | Role ID String>',
    requiredPermissions: ['ADMINISTRATOR'],
    description: 'Specifies what role each command requires.',
    callback: function (message, args, text, prefix, client, instance) {
        var name = (args.shift() || '').toLowerCase();
        var roleId = message.mentions.roles.first() || (args.shift() || '').toLowerCase();
        if (typeof roleId !== 'string') {
            roleId = roleId.id;
        }
        var guild = message.guild;
        if (!guild) {
            message.reply('You cannot change required roles in private messages');
            return;
        }
        var command = instance.commandHandler.getCommand(name);
        if (command) {
            if (roleId === 'none') {
                command.removeRequiredRole(guild.id, roleId);
                message.reply("Removed all required roles from command \"" + command.names[0] + "\"");
            }
            else {
                command.addRequiredRole(guild.id, roleId);
                message.reply("Added role \"" + roleId + "\" to command \"" + command.names[0] + "\"");
            }
        }
        else {
            message.reply("Could not find command \"" + name + "\"! View all commands with \"" + instance.getPrefix(guild) + "commands\"");
        }
    },
};
