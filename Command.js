"use strict";
var Command = /** @class */ (function () {
    function Command(instance, client, names, callback, _a) {
        var minArgs = _a.minArgs, maxArgs = _a.maxArgs, syntaxError = _a.syntaxError, expectedArgs = _a.expectedArgs, description = _a.description, requiredPermissions = _a.requiredPermissions;
        this._names = [];
        this._minArgs = 0;
        this._maxArgs = -1;
        this._requiredPermissions = [];
        this._requiredRoles = new Map(); // <GuildID, RoleIDs[]>
        this._callback = function () { };
        this._disabled = [];
        this.instance = instance;
        this.client = client;
        this._names = typeof names === 'string' ? [names] : names;
        this._minArgs = minArgs || 0;
        this._maxArgs = maxArgs === undefined ? -1 : maxArgs;
        this._syntaxError = syntaxError;
        this._expectedArgs = expectedArgs;
        this._description = description;
        this._requiredPermissions = requiredPermissions;
        this._callback = callback;
        if (this._minArgs < 0) {
            throw new Error("Command \"" + names[0] + "\" has a minimum argument count less than 0!");
        }
        if (this._maxArgs < -1) {
            throw new Error("Command \"" + names[0] + "\" has a maximum argument count less than -1!");
        }
        if (this._maxArgs !== -1 && this._maxArgs < this._minArgs) {
            throw new Error("Command \"" + names[0] + "\" has a maximum argument count less than it's minimum argument count!");
        }
    }
    Command.prototype.execute = function (message, args) {
        this._callback(message, args, args.join(' '), this.client, this.instance.getPrefix(message.guild), this.instance);
    };
    Object.defineProperty(Command.prototype, "names", {
        get: function () {
            return this._names;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Command.prototype, "minArgs", {
        get: function () {
            return this._minArgs;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Command.prototype, "maxArgs", {
        get: function () {
            return this._maxArgs;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Command.prototype, "syntaxError", {
        get: function () {
            return this._syntaxError;
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
    Object.defineProperty(Command.prototype, "description", {
        get: function () {
            return this._description;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Command.prototype, "requiredPermissions", {
        get: function () {
            return this._requiredPermissions;
        },
        enumerable: false,
        configurable: true
    });
    Command.prototype.addRequiredRole = function (guildId, roleId) {
        var _a, _b;
        var array = ((_a = this._requiredRoles) === null || _a === void 0 ? void 0 : _a.get(guildId)) || [];
        if (!array.includes(roleId)) {
            array.push(roleId);
            (_b = this._requiredRoles) === null || _b === void 0 ? void 0 : _b.set(guildId, array);
            console.log("Added " + roleId + " to " + this._names[0] + " for guild " + guildId);
        }
    };
    Command.prototype.removeRequiredRole = function (guildId, roleId) {
        var _a, _b;
        if (roleId === 'none') {
            (_a = this._requiredRoles) === null || _a === void 0 ? void 0 : _a.delete(guildId);
            return;
        }
        var array = ((_b = this._requiredRoles) === null || _b === void 0 ? void 0 : _b.get(guildId)) || [];
        var index = array ? array.indexOf(roleId) : -1;
        if (array && index >= 0) {
            array.splice(index, 1);
            console.log("Removed " + roleId + " from " + this._names[0] + " for guild " + guildId);
        }
    };
    Command.prototype.getRequiredRoles = function (guildId) {
        var map = this._requiredRoles || new Map();
        return map.get(guildId) || [];
    };
    Object.defineProperty(Command.prototype, "callback", {
        get: function () {
            return this._callback;
        },
        enumerable: false,
        configurable: true
    });
    Command.prototype.disable = function (guildId) {
        if (!this._disabled.includes(guildId)) {
            this._disabled.push(guildId);
        }
    };
    Command.prototype.enable = function (guildId) {
        var index = this._disabled.indexOf(guildId);
        if (index >= 0) {
            this._disabled.splice(index, 1);
        }
    };
    Command.prototype.isDisabled = function (guildId) {
        return this._disabled.includes(guildId);
    };
    return Command;
}());
module.exports = Command;
