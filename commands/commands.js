"use strict";
module.exports = {
    maxArgs: 0,
    callback: function (message, args, text, prefix, client, instance) {
        var msg = 'Commands:\n';
        for (var _i = 0, _a = instance.commands; _i < _a.length; _i++) {
            var command = _a[_i];
            var names = command.names, description = command.description;
            msg += "\n**" + names.shift() + "**\nAliases: " + (names.length ? "\"" + names.join('", "') + "\"" : 'None') + "\nDescription: " + (description || 'None') + "\n";
        }
        message.channel.send(msg);
    },
};
