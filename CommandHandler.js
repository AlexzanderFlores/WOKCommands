"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var fs_1 = __importDefault(require("fs"));
var Command_1 = __importDefault(require("./Command"));
var get_all_files_1 = __importDefault(require("./get-all-files"));
var disabled_commands_1 = __importDefault(require("./modles/disabled-commands"));
var CommandHandler = /** @class */ (function () {
    function CommandHandler(instance, client, dir) {
        var _this = this;
        this._commands = new Map();
        this._disabled = new Map(); // <GuildID, Command Name>
        if (dir) {
            if (fs_1.default.existsSync(dir)) {
                var files = get_all_files_1.default(dir);
                var amount = files.length;
                if (amount > 0) {
                    this.fetchDisabledCommands();
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
                                    if (guild) {
                                        var isDisabled = instance.commandHandler.isCommandDisabled(guild.id, command.names[0]);
                                        if (isDisabled) {
                                            message.reply('That command is currently disabled in this server');
                                            return;
                                        }
                                    }
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
        var _a = configuration.name, name = _a === void 0 ? fileName : _a, commands = configuration.commands, aliases = configuration.aliases, callback = configuration.callback, execute = configuration.execute, run = configuration.run, description = configuration.description;
        var callbackCounter = 0;
        if (callback)
            ++callbackCounter;
        if (execute)
            ++callbackCounter;
        if (run)
            ++callbackCounter;
        if (callbackCounter > 1) {
            throw new Error('Commands can have "callback", "execute", or "run" functions, but not multiple.');
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
        var hasCallback = callback || execute || run;
        if (hasCallback) {
            var command = new Command_1.default(instance, client, names, callback || execute || run, configuration);
            for (var _i = 0, names_1 = names; _i < names_1.length; _i++) {
                var name_2 = names_1[_i];
                // Ensure the alias is lower case because we read as lower case later on
                this._commands.set(name_2.toLowerCase(), command);
            }
        }
    };
    Object.defineProperty(CommandHandler.prototype, "commands", {
        get: function () {
            var results = [];
            this._commands.forEach(function (_a) {
                var names = _a.names, _b = _a.description, description = _b === void 0 ? '' : _b;
                results.push({
                    names: __spreadArrays(names),
                    description: description,
                });
            });
            return results;
        },
        enumerable: false,
        configurable: true
    });
    CommandHandler.prototype.fetchDisabledCommands = function () {
        return __awaiter(this, void 0, void 0, function () {
            var results, _i, results_1, result, guildId, command, array;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, disabled_commands_1.default.find({})];
                    case 1:
                        results = _a.sent();
                        for (_i = 0, results_1 = results; _i < results_1.length; _i++) {
                            result = results_1[_i];
                            guildId = result.guildId, command = result.command;
                            array = this._disabled.get(guildId) || [];
                            array.push(command);
                            this._disabled.set(guildId, array);
                        }
                        console.log(this._disabled);
                        return [2 /*return*/];
                }
            });
        });
    };
    CommandHandler.prototype.disableCommand = function (guildId, command) {
        var array = this._disabled.get(guildId) || [];
        if (array && !array.includes(command)) {
            array.push(command);
            this._disabled.set(guildId, array);
        }
    };
    CommandHandler.prototype.enableCommand = function (guildId, command) {
        var array = this._disabled.get(guildId) || [];
        var index = array ? array.indexOf(command) : -1;
        if (array && index >= 0) {
            array.splice(index, 1);
        }
    };
    CommandHandler.prototype.isCommandDisabled = function (guildId, command) {
        var array = this._disabled.get(guildId);
        return (array && array.includes(command)) || false;
    };
    return CommandHandler;
}());
module.exports = CommandHandler;
