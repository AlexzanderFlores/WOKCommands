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
                        this.registerCommand(instance, client, file, fileName);
                    }
                    client.on('message', function (message) {
                        var guild = message.guild;
                        var content = message.content;
                        var prefix = instance.getPrefix(guild);
                        if (content.startsWith(prefix)) {
                            // Remove the prefix
                            content = content.substring(prefix.length);
                            var args = content.split(/ /g);
                            // Remove the "command", leaving just the arguments
                            var firstElement = args.shift();
                            if (firstElement) {
                                // Ensure the user input is lower case because it is stored as lower case in the map
                                var name_1 = firstElement.toLowerCase();
                                var command = _this._commands.get(name_1);
                                if (command) {
                                    var minArgs = command.minArgs, maxArgs = command.maxArgs, expectedArgs = command.expectedArgs;
                                    var _a = command.syntaxError, syntaxError = _a === void 0 ? instance.syntaxError : _a;
                                    // Are the proper number of arguments provided?
                                    if ((minArgs !== undefined && args.length < minArgs) ||
                                        (maxArgs !== undefined &&
                                            maxArgs !== -1 &&
                                            args.length > maxArgs)) {
                                        // Replace {PREFIX} with the actual prefix
                                        if (syntaxError) {
                                            syntaxError = syntaxError.replace(/{PREFIX}/g, prefix);
                                        }
                                        // Replace {COMMAND} with the name of the command that was ran
                                        syntaxError = syntaxError.replace(/{COMMAND}/g, name_1);
                                        // Replace {ARGUMENTS} with the expectedArgs property from the command
                                        // If one was not provided then replace {ARGUMENTS} with an empty string
                                        syntaxError = syntaxError.replace(/ {ARGUMENTS}/g, expectedArgs ? " " + expectedArgs : '');
                                        // Reply with the local or global syntax error
                                        message.reply(syntaxError);
                                        return;
                                    }
                                    command.execute(message, args);
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
    CommandHandler.prototype.registerCommand = function (instance, client, file, fileName) {
        var configuration = require(file);
        var _a = configuration.name, name = _a === void 0 ? fileName : _a, commands = configuration.commands, aliases = configuration.aliases, callback = configuration.callback, execute = configuration.execute, description = configuration.description;
        if (callback && execute) {
            throw new Error('Commands can have "callback" or "execute" functions, but not both.');
        }
        var names = commands || aliases || [];
        if (!name && (!names || names.length === 0)) {
            throw new Error("Command located at \"" + file + "\" does not have a name, commands array, or aliases array set. Please set at lease one property to specify the command name.");
        }
        if (typeof names === 'string') {
            names = [names];
        }
        if (name && !names.includes(name.toLowerCase())) {
            names.unshift(name.toLowerCase());
        }
        if (!description) {
            console.warn("WOKCommands > Command \"" + names[0] + "\" does not have a \"description\" property.");
        }
        var hasCallback = callback || execute;
        if (hasCallback) {
            var command = new Command_1.default(instance, client, names, callback || execute, configuration);
            for (var _i = 0, names_1 = names; _i < names_1.length; _i++) {
                var name_2 = names_1[_i];
                // Ensure the alias is lower case because we read as lower case later on
                this._commands.set(name_2.toLowerCase(), command);
            }
        }
    };
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
