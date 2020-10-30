"use strict";
module.exports = {
    maxArgs: 0,
    description: 'Lists all commands for this bot',
    callback: function (message, args, text, prefix, client, instance) {
        var msg = 'Commands:\n';
        for (var _i = 0, _a = instance.commands; _i < _a.length; _i++) {
            var command = _a[_i];
            var names = command.names, description = command.description;
            var mainName = names.shift() || '';
            msg += "\n**" + mainName + "**\nAliases: " + (names.length ? "\"" + names.join('", "') + "\"" : 'None') + "\nDescription: " + (description || 'None') + "\nEnabled: " + (message.guild
                ? instance.commandHandler.isCommandDisabled(message.guild.id, mainName)
                    ? 'No'
                    : 'Yes'
                : '') + "\n";
        }
        message.channel.send(msg);
    },
};
