"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var CommandHandler_1 = __importDefault(require("./CommandHandler"));
var ListenerHandler_1 = __importDefault(require("./ListenerHandler"));
var WOKCommands = /** @class */ (function () {
    function WOKCommands(client, commandsDir, listenerDir) {
        var _this = this;
        this._defaultPrefix = '!';
        this._commandsDir = 'commands';
        this._listenerDir = '';
        this._mongo = '';
        this._prefixes = {};
        if (!client) {
            throw new Error('No Discord JS Client provided as first argument!');
        }
        if (!commandsDir) {
            console.warn('WOKCommands > No commands folder specified. Using "commands"');
        }
        // Get the directory path of the project using this package
        // This way users don't need to use path.join(__dirname, 'dir')
        if (module && module.parent) {
            // @ts-ignore
            var path = module.parent.path;
            if (path) {
                commandsDir = path + "/" + (commandsDir || this._commandsDir);
                if (listenerDir) {
                    listenerDir = path + "/" + listenerDir;
                }
            }
        }
        this._commandsDir = commandsDir || this._commandsDir;
        this._listenerDir = listenerDir || this._listenerDir;
        this._commandHandler = new CommandHandler_1.default(this, client, this._commandsDir);
        if (this._listenerDir) {
            new ListenerHandler_1.default(client, this._listenerDir);
        }
        setTimeout(function () {
            if (!_this._mongo) {
                console.warn('WOKCommands > No MongoDB connection URI provided. Some features might not work!');
            }
        }, 1000);
    }
    Object.defineProperty(WOKCommands.prototype, "mongoPath", {
        get: function () {
            return this._mongo;
        },
        enumerable: false,
        configurable: true
    });
    WOKCommands.prototype.setMongoPath = function (mongoPath) {
        this._mongo = mongoPath;
        return this;
    };
    Object.defineProperty(WOKCommands.prototype, "prefixes", {
        get: function () {
            return this._prefixes;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WOKCommands.prototype, "defaultPrefix", {
        get: function () {
            return this._defaultPrefix;
        },
        enumerable: false,
        configurable: true
    });
    WOKCommands.prototype.setDefaultPrefix = function (defaultPrefix) {
        this._defaultPrefix = defaultPrefix;
        return this;
    };
    WOKCommands.prototype.getPrefix = function (guild) {
        return this._prefixes[guild ? guild.id : ''] || this._defaultPrefix;
    };
    Object.defineProperty(WOKCommands.prototype, "commands", {
        get: function () {
            return this._commandHandler.commands;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WOKCommands.prototype, "commandAmount", {
        get: function () {
            return this.commands.length;
        },
        enumerable: false,
        configurable: true
    });
    return WOKCommands;
}());
module.exports = WOKCommands;
