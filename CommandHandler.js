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
var path_1 = __importDefault(require("path"));
var Command_1 = __importDefault(require("./Command"));
var get_all_files_1 = __importDefault(require("./get-all-files"));
var disabled_commands_1 = __importDefault(require("./models/disabled-commands"));
var required_roles_1 = __importDefault(require("./models/required-roles"));
var permissions_1 = __importDefault(require("./permissions"));
var cooldown_1 = __importDefault(require("./models/cooldown"));
var CommandHandler = /** @class */ (function () {
    function CommandHandler(instance, client, dir) {
        var _this = this;
        this._commands = new Map();
        // Register built in commands
        for (var _i = 0, _a = get_all_files_1.default(path_1.default.join(__dirname, 'commands')); _i < _a.length; _i++) {
            var _b = _a[_i], file = _b[0], fileName = _b[1];
            this.registerCommand(instance, client, file, fileName);
        }
        if (dir) {
            if (fs_1.default.existsSync(dir)) {
                var files = get_all_files_1.default(dir);
                var amount = files.length;
                if (amount > 0) {
                    this.fetchDisabledCommands();
                    this.fetchRequiredRoles();
                    console.log("WOKCommands > Loaded " + amount + " command" + (amount === 1 ? '' : 's') + ".");
                    for (var _c = 0, files_1 = files; _c < files_1.length; _c++) {
                        var _d = files_1[_c], file = _d[0], fileName = _d[1];
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
                                        var isDisabled = command.isDisabled(guild.id);
                                        if (isDisabled) {
                                            message.reply('That command is currently disabled in this server');
                                            return;
                                        }
                                    }
                                    var member = message.member, user = message.author;
                                    var minArgs = command.minArgs, maxArgs = command.maxArgs, expectedArgs = command.expectedArgs, _a = command.requiredPermissions, requiredPermissions = _a === void 0 ? [] : _a, cooldown_2 = command.cooldown, globalCooldown = command.globalCooldown;
                                    var _b = command.syntaxError, syntaxError = _b === void 0 ? instance.syntaxError : _b;
                                    if (guild && member) {
                                        for (var _i = 0, requiredPermissions_1 = requiredPermissions; _i < requiredPermissions_1.length; _i++) {
                                            var perm = requiredPermissions_1[_i];
                                            // @ts-ignore
                                            if (!member.hasPermission(perm)) {
                                                message.reply("You must have the \"" + perm + "\" permission in order to use this command.");
                                                return;
                                            }
                                        }
                                        var roles = command.getRequiredRoles(guild.id);
                                        if (roles && roles.length) {
                                            var hasRole = false;
                                            for (var _c = 0, roles_1 = roles; _c < roles_1.length; _c++) {
                                                var role = roles_1[_c];
                                                if (member.roles.cache.has(role)) {
                                                    hasRole = true;
                                                    break;
                                                }
                                            }
                                            if (!hasRole) {
                                                message.reply('You do not have any of the required roles to use this command!');
                                                return;
                                            }
                                        }
                                    }
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
                                    // Check for cooldowns
                                    if ((cooldown_2 || globalCooldown) && user) {
                                        var guildId = guild ? guild.id : 'dm';
                                        var secondsLeft = command.getCooldownSeconds(guildId, user.id);
                                        if (secondsLeft) {
                                            message.reply("You must wait " + secondsLeft + " before using that command again.");
                                            return;
                                        }
                                        command.setCooldown(guildId, user.id);
                                    }
                                    command.execute(message, args);
                                }
                            }
                        }
                    });
                    // If we cannot connect to a database then ensure all cooldowns are less than 5m
                    instance.on('databaseConnected', function (connection, state) {
                        _this._commands.forEach(function (command) { return __awaiter(_this, void 0, void 0, function () {
                            var connected, results, _i, results_1, _a, _id, cooldown_3, _b, name_2, guildId, userId;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        connected = state === 'Connected';
                                        command.verifyDatabaseCooldowns(connected);
                                        if (!connected) return [3 /*break*/, 2];
                                        return [4 /*yield*/, cooldown_1.default.find({
                                                name: command.names[0],
                                                type: command.globalCooldown ? 'global' : 'per-user',
                                            })
                                            // @ts-ignore
                                        ];
                                    case 1:
                                        results = _c.sent();
                                        // @ts-ignore
                                        for (_i = 0, results_1 = results; _i < results_1.length; _i++) {
                                            _a = results_1[_i], _id = _a._id, cooldown_3 = _a.cooldown;
                                            _b = _id.split('-'), name_2 = _b[0], guildId = _b[1], userId = _b[2];
                                            command.setCooldown(guildId, userId, cooldown_3);
                                        }
                                        _c.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        }); });
                    });
                }
            }
            else {
                throw new Error("Commands directory \"" + dir + "\" doesn't exist!");
            }
        }
        var decrementCountdown = function () {
            _this._commands.forEach(function (command) {
                command.decrementCooldowns();
            });
            setTimeout(decrementCountdown, 1000);
        };
        decrementCountdown();
    }
    CommandHandler.prototype.registerCommand = function (instance, client, file, fileName) {
        var configuration = require(file);
        var _a = configuration.name, name = _a === void 0 ? fileName : _a, category = configuration.category, commands = configuration.commands, aliases = configuration.aliases, init = configuration.init, callback = configuration.callback, execute = configuration.execute, run = configuration.run, description = configuration.description, requiredPermissions = configuration.requiredPermissions;
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
        if (requiredPermissions) {
            for (var _i = 0, requiredPermissions_2 = requiredPermissions; _i < requiredPermissions_2.length; _i++) {
                var perm = requiredPermissions_2[_i];
                if (!permissions_1.default.includes(perm)) {
                    throw new Error("Command located at \"" + file + "\" has an invalid permission node: \"" + perm + "\". Permissions must be all upper case and be one of the following: \"" + __spreadArrays(permissions_1.default).join('", "') + "\"");
                }
            }
        }
        var missing = [];
        if (!category) {
            missing.push('Category');
        }
        if (!description) {
            missing.push('Description');
        }
        if (missing.length) {
            console.warn("WOKCommands > Command \"" + names[0] + "\" does not have the following properties: " + missing + ".");
        }
        var hasCallback = callback || execute || run;
        if (hasCallback) {
            if (init) {
                init(client, instance);
            }
            var command = new Command_1.default(instance, client, names, hasCallback, configuration);
            for (var _b = 0, names_1 = names; _b < names_1.length; _b++) {
                var name_3 = names_1[_b];
                // Ensure the alias is lower case because we read as lower case later on
                this._commands.set(name_3.toLowerCase(), command);
            }
        }
    };
    Object.defineProperty(CommandHandler.prototype, "commands", {
        get: function () {
            var results = [];
            var added = [];
            this._commands.forEach(function (_a) {
                var names = _a.names, _b = _a.category, category = _b === void 0 ? '' : _b, _c = _a.description, description = _c === void 0 ? '' : _c, _d = _a.expectedArgs, expectedArgs = _d === void 0 ? '' : _d;
                if (!added.includes(names[0])) {
                    results.push({
                        names: __spreadArrays(names),
                        category: category,
                        description: description,
                        syntax: expectedArgs,
                    });
                    added.push(names[0]);
                }
            });
            return results;
        },
        enumerable: false,
        configurable: true
    });
    CommandHandler.prototype.getCommandsByCategory = function (category) {
        var results = [];
        for (var _i = 0, _a = this.commands; _i < _a.length; _i++) {
            var command = _a[_i];
            if (command.category === category) {
                results.push(command);
            }
        }
        return results;
    };
    CommandHandler.prototype.getCommand = function (name) {
        return this._commands.get(name);
    };
    CommandHandler.prototype.fetchDisabledCommands = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var results, _i, results_2, result, guildId, command;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, disabled_commands_1.default.find({})];
                    case 1:
                        results = _b.sent();
                        for (_i = 0, results_2 = results; _i < results_2.length; _i++) {
                            result = results_2[_i];
                            guildId = result.guildId, command = result.command;
                            (_a = this._commands.get(command)) === null || _a === void 0 ? void 0 : _a.disable(guildId);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    CommandHandler.prototype.fetchRequiredRoles = function () {
        return __awaiter(this, void 0, void 0, function () {
            var results, _i, results_3, result, guildId, command, requiredRoles_2, cmd, _a, requiredRoles_1, roleId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, required_roles_1.default.find({})];
                    case 1:
                        results = _b.sent();
                        for (_i = 0, results_3 = results; _i < results_3.length; _i++) {
                            result = results_3[_i];
                            guildId = result.guildId, command = result.command, requiredRoles_2 = result.requiredRoles;
                            cmd = this._commands.get(command);
                            if (cmd) {
                                for (_a = 0, requiredRoles_1 = requiredRoles_2; _a < requiredRoles_1.length; _a++) {
                                    roleId = requiredRoles_1[_a];
                                    cmd.addRequiredRole(guildId, roleId);
                                }
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return CommandHandler;
}());
module.exports = CommandHandler;
