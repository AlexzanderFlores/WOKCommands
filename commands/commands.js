"use strict";
module.exports = {
    maxArgs: 0,
    description: 'Lists all commands for this bot',
    callback: function (message, args, text, client, prefix, instance) {
        var _a;
        var msg = 'Commands:\n';
        for (var _i = 0, _b = instance.commandHandler.commands; _i < _b.length; _i++) {
            var command = _b[_i];
            var names = command.names, description = command.description;
            var mainName = names.shift() || '';
            msg += "\n**" + mainName + "**\nAliases: " + (names.length ? "\"" + names.join('", "') + "\"" : 'None') + "\nDescription: " + (description || 'None') + "\nEnabled: " + (message.guild
                ? ((_a = instance.commandHandler
                    .getCommand(mainName)) === null || _a === void 0 ? void 0 : _a.isDisabled(message.guild.id)) ? 'No'
                    : 'Yes'
                : '') + "\n";
        }
        message.channel.send(msg);
    },
};
