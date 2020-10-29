"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var fs_1 = __importDefault(require("fs"));
var Command_1 = __importDefault(require("./Command"));
var get_all_files_1 = __importDefault(require("./get-all-files"));
var CommandHandler = /** @class */ (function () {
    function CommandHandler(instance, client, dir) {
        var _this = this;
        this._commands = new Map();
        if (dir) {
            if (fs_1.default.existsSync(dir)) {
                var files = get_all_files_1.default(dir);
                var amount = files.length;
                if (amount > 0) {
                    console.log("WOKCommands > Loaded " + amount + " command" + (amount === 1 ? '' : 's') + ".");
                    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
                        var _a = files_1[_i], file = _a[0], fileName = _a[1];
                        var configuration = require(file);
                        var _b = configuration.name, name_1 = _b === void 0 ? fileName : _b, commands = configuration.commands, aliases = configuration.aliases, callback = configuration.callback, execute = configuration.execute, description = configuration.description;
                        if (callback && execute) {
                            throw new Error('Commands can have "callback" or "execute" functions, but not both.');
                        }
                        var names = commands || aliases || [];
                        if (!name_1 && (!names || names.length === 0)) {
                            throw new Error("Command located at \"" + file + "\" does not have a name, commands array, or aliases array set. Please set at lease one property to specify the command name.");
                        }
                        if (typeof names === 'string') {
                            names = [names];
                        }
                        if (name_1 && !names.includes(name_1.toLowerCase())) {
                            names.unshift(name_1.toLowerCase());
                        }
                        if (!description) {
                            console.warn("WOKCommands > Command \"" + names[0] + "\" does not have a \"description\" property.");
                        }
                        var hasCallback = callback || execute;
                        if (hasCallback) {
                            var command = new Command_1.default(instance, client, names, callback || execute, configuration);
                            for (var _c = 0, names_1 = names; _c < names_1.length; _c++) {
                                var name_2 = names_1[_c];
                                // Ensure the alias is lower case because we read as lower case later on
                                this._commands.set(name_2.toLowerCase(), command);
                            }
                        }
                    }
                    client.on('message', function (message) {
                        var guild = message.guild;
                        var content = message.content;
                        var prefix = instance.getPrefix(guild);
                        if (content.startsWith(prefix)) {
                            // Remove the prefix
                            content = content.substring(prefix.length);
                            // Get each word as an element of an array
                            var words = content.split(/ /g);
                            // Remove the "command", leaving just the arguments
                            var firstElement = words.shift();
                            if (firstElement) {
                                // Ensure the user input is lower case because it is stored as lower case in the map
                                var alias = firstElement.toLowerCase();
                                var command = _this._commands.get(alias);
                                if (command) {
                                    command.execute(message, words);
                                }
                            }
                        }
                    });
                }
            }
            else {
                throw new Error("Commands directory \"" + dir + "\" doesn't exist!");
            }
        }
    }
    Object.defineProperty(CommandHandler.prototype, "commands", {
        get: function () {
            var results = new Map();
            this._commands.forEach(function (_a) {
                var names = _a.names, _b = _a.description, description = _b === void 0 ? '' : _b;
                results.set(names[0], {
                    names: names,
                    description: description,
                });
            });
            return Array.from(results.values());
        },
        enumerable: false,
        configurable: true
    });
    return CommandHandler;
}());
module.exports = CommandHandler;
