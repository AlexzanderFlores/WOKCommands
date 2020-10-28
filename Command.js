"use strict";
var Command = /** @class */ (function () {
    function Command(instance, client, _a) {
        var aliases = _a.aliases, minArgs = _a.minArgs, maxArgs = _a.maxArgs, expectedArgs = _a.expectedArgs, callback = _a.callback;
        this._aliases = [];
        this._minArgs = 0;
        this._maxArgs = -1;
        this._cooldown = [];
        this._callback = function () { };
        this.instance = instance;
        this.client = client;
        this._aliases = typeof aliases === 'string' ? [aliases] : aliases;
        this._minArgs = minArgs || 0;
        this._maxArgs = maxArgs || -1;
        this._expectedArgs = expectedArgs;
        this._callback = callback;
    }
    Command.prototype.execute = function (message, args) {
        this._callback(message, args, args.join(' '), this.client, message.guild
            ? this.instance.prefixes[message.guild.id]
            : this.instance.defaultPrefix);
    };
    Object.defineProperty(Command.prototype, "aliases", {
        get: function () {
            return this._aliases;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Command.prototype, "minArgs", {
        get: function () {
            return this.minArgs;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Command.prototype, "maxArgs", {
        get: function () {
            return this.maxArgs;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Command.prototype, "expectedArgs", {
        get: function () {
            return this._expectedArgs;
        },
        enumerable: false,
        configurable: true
    });
    Command.prototype.setCooldown = function (member, seconds) {
        if (typeof member !== 'string') {
            member = member.id;
        }
        console.log("Setting cooldown of " + member + " for " + seconds + "s");
    };
    Command.prototype.clearCooldown = function (member, seconds) {
        if (typeof member !== 'string') {
            member = member.id;
        }
        console.log("Clearing cooldown of " + member + " for " + seconds + "s");
    };
    Object.defineProperty(Command.prototype, "callback", {
        get: function () {
            return this._callback;
        },
        enumerable: false,
        configurable: true
    });
    return Command;
}());
module.exports = Command;
