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
var cooldown_1 = __importDefault(require("./models/cooldown"));
var channel_commands_1 = __importDefault(require("./models/channel-commands"));
var permissions_1 = require("./permissions");
var CommandErrors_1 = __importDefault(require("./enums/CommandErrors"));
var Events_1 = __importDefault(require("./enums/Events"));
var CommandHandler = /** @class */ (function () {
    function CommandHandler(instance, client, dir, disabledDefaultCommands) {
        var _this = this;
        this._commands = new Map();
        this._client = null;
        this._client = client;
        // Register built in commands
        for (var _i = 0, _a = get_all_files_1.default(path_1.default.join(__dirname, "commands")); _i < _a.length; _i++) {
            var _b = _a[_i], file = _b[0], fileName = _b[1];
            if (disabledDefaultCommands.includes(fileName)) {
                continue;
            }
            this.registerCommand(instance, client, file, fileName);
        }
        if (dir) {
            if (!fs_1.default.existsSync(dir)) {
                throw new Error("Commands directory \"" + dir + "\" doesn't exist!");
            }
            var files = get_all_files_1.default(dir);
            var amount = files.length;
            if (amount <= 0) {
                return;
            }
            console.log("WOKCommands > Loaded " + amount + " command" + (amount === 1 ? "" : "s") + ".");
            for (var _c = 0, files_1 = files; _c < files_1.length; _c++) {
                var _d = files_1[_c], file = _d[0], fileName = _d[1];
                this.registerCommand(instance, client, file, fileName);
            }
            client.on("message", function (message) {
                var _a;
                var guild = message.guild;
                var content = message.content;
                var prefix = instance.getPrefix(guild);
                if (!content.startsWith(prefix)) {
                    return;
                }
                if (instance.ignoreBots && message.author.bot) {
                    return;
                }
                // Remove the prefix
                content = content.substring(prefix.length);
                var args = content.split(/ /g);
                // Remove the "command", leaving just the arguments
                var firstElement = args.shift();
                if (!firstElement) {
                    return;
                }
                // Ensure the user input is lower case because it is stored as lower case in the map
                var name = firstElement.toLowerCase();
                var command = _this._commands.get(name);
                if (!command) {
                    return;
                }
                var error = command.error, slash = command.slash;
                if (slash === true) {
                    return;
                }
                if (guild) {
                    var isDisabled = command.isDisabled(guild.id);
                    if (isDisabled) {
                        if (error) {
                            error({
                                error: CommandErrors_1.default.COMMAND_DISABLED,
                                command: command,
                                message: message,
                            });
                        }
                        else {
                            message
                                .reply(instance.messageHandler.get(guild, "DISABLED_COMMAND"))
                                .then(function (message) {
                                console.log(instance.del);
                                if (instance.del === -1) {
                                    return;
                                }
                                setTimeout(function () {
                                    message.delete();
                                }, 1000 * instance.del);
                            });
                        }
                        return;
                    }
                }
                var member = message.member, user = message.author;
                var minArgs = command.minArgs, maxArgs = command.maxArgs, expectedArgs = command.expectedArgs, requiredPermissions = command.requiredPermissions, cooldown = command.cooldown, globalCooldown = command.globalCooldown, testOnly = command.testOnly;
                if (testOnly && (!guild || !instance.testServers.includes(guild.id))) {
                    return;
                }
                if (guild && member) {
                    for (var _i = 0, _b = requiredPermissions || []; _i < _b.length; _i++) {
                        var perm = _b[_i];
                        // @ts-ignore
                        if (!member.hasPermission(perm)) {
                            if (error) {
                                error({
                                    error: CommandErrors_1.default.MISSING_PERMISSIONS,
                                    command: command,
                                    message: message,
                                });
                            }
                            else {
                                message
                                    .reply(instance.messageHandler.get(guild, "MISSING_PERMISSION", {
                                    PERM: perm,
                                }))
                                    .then(function (message) {
                                    if (instance.del === -1) {
                                        return;
                                    }
                                    setTimeout(function () {
                                        message.delete();
                                    }, 1000 * instance.del);
                                });
                            }
                            return;
                        }
                    }
                    var roles = command.getRequiredRoles(guild.id);
                    if (roles && roles.length) {
                        var missingRoles = [];
                        var missingRolesNames = [];
                        for (var _c = 0, roles_1 = roles; _c < roles_1.length; _c++) {
                            var role = roles_1[_c];
                            if (!member.roles.cache.has(role)) {
                                missingRoles.push(role);
                                missingRolesNames.push((_a = guild.roles.cache.get(role)) === null || _a === void 0 ? void 0 : _a.name);
                            }
                        }
                        if (missingRoles.length) {
                            if (error) {
                                error({
                                    error: CommandErrors_1.default.MISSING_ROLES,
                                    command: command,
                                    message: message,
                                    info: {
                                        missingRoles: missingRoles,
                                    },
                                });
                            }
                            else {
                                message
                                    .reply(instance.messageHandler.get(guild, "MISSING_ROLES", {
                                    ROLES: missingRolesNames.join(", "),
                                }))
                                    .then(function (message) {
                                    if (instance.del === -1) {
                                        return;
                                    }
                                    setTimeout(function () {
                                        message.delete();
                                    }, 1000 * instance.del);
                                });
                            }
                            return;
                        }
                    }
                }
                // Are the proper number of arguments provided?
                if ((minArgs !== undefined && args.length < minArgs) ||
                    (maxArgs !== undefined && maxArgs !== -1 && args.length > maxArgs)) {
                    var syntaxError = command.syntaxError || {};
                    var messageHandler = instance.messageHandler;
                    var errorMsg = syntaxError[messageHandler.getLanguage(guild)] ||
                        instance.messageHandler.get(guild, "SYNTAX_ERROR");
                    // Replace {PREFIX} with the actual prefix
                    if (errorMsg) {
                        errorMsg = errorMsg.replace(/{PREFIX}/g, prefix);
                    }
                    // Replace {COMMAND} with the name of the command that was ran
                    errorMsg = errorMsg.replace(/{COMMAND}/g, name);
                    // Replace {ARGUMENTS} with the expectedArgs property from the command
                    // If one was not provided then replace {ARGUMENTS} with an empty string
                    errorMsg = errorMsg.replace(/ {ARGUMENTS}/g, expectedArgs ? " " + expectedArgs : "");
                    if (error) {
                        error({
                            error: CommandErrors_1.default.INVALID_ARGUMENTS,
                            command: command,
                            message: message,
                            info: {
                                minArgs: minArgs,
                                maxArgs: maxArgs,
                                length: args.length,
                                errorMsg: errorMsg,
                            },
                        });
                    }
                    else {
                        // Reply with the local or global syntax error
                        message.reply(errorMsg);
                    }
                    return;
                }
                // Check for cooldowns
                if ((cooldown || globalCooldown) && user) {
                    var guildId = guild ? guild.id : "dm";
                    var timeLeft = command.getCooldownSeconds(guildId, user.id);
                    if (timeLeft) {
                        if (error) {
                            error({
                                error: CommandErrors_1.default.COOLDOWN,
                                command: command,
                                message: message,
                                info: {
                                    timeLeft: timeLeft,
                                },
                            });
                        }
                        else {
                            message.reply(instance.messageHandler.get(guild, "COOLDOWN", {
                                COOLDOWN: timeLeft,
                            }));
                        }
                        return;
                    }
                    command.setCooldown(guildId, user.id);
                }
                // Check for channel specific commands
                if (guild) {
                    var key = guild.id + "-" + command.names[0];
                    var channels = command.requiredChannels.get(key);
                    if (channels &&
                        channels.length &&
                        !channels.includes(message.channel.id)) {
                        var channelList = "";
                        for (var _d = 0, channels_1 = channels; _d < channels_1.length; _d++) {
                            var channel = channels_1[_d];
                            channelList += "<#" + channel + ">, ";
                        }
                        channelList = channelList.substring(0, channelList.length - 2);
                        message.reply(instance.messageHandler.get(guild, "ALLOWED_CHANNELS", {
                            CHANNELS: channelList,
                        }));
                        return;
                    }
                }
                try {
                    command.execute(message, args);
                }
                catch (e) {
                    if (error) {
                        error({
                            error: CommandErrors_1.default.EXCEPTION,
                            command: command,
                            message: message,
                            info: {
                                error: e,
                            },
                        });
                    }
                    else {
                        message.reply(instance.messageHandler.get(guild, "EXCEPTION"));
                        console.error(e);
                    }
                    instance.emit(Events_1.default.COMMAND_EXCEPTION, command, message, e);
                }
            });
            // If we cannot connect to a database then ensure all cooldowns are less than 5m
            instance.on(Events_1.default.DATABASE_CONNECTED, function (connection, state) { return __awaiter(_this, void 0, void 0, function () {
                var connected;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            connected = state === "Connected";
                            if (!connected) {
                                return [2 /*return*/];
                            }
                            // Load previously used cooldowns
                            return [4 /*yield*/, this.fetchDisabledCommands()];
                        case 1:
                            // Load previously used cooldowns
                            _a.sent();
                            return [4 /*yield*/, this.fetchRequiredRoles()];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, this.fetchChannelOnly()];
                        case 3:
                            _a.sent();
                            this._commands.forEach(function (command) { return __awaiter(_this, void 0, void 0, function () {
                                var results, _i, results_1, _a, _id, cooldown_2, _b, name_1, guildId, userId;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            command.verifyDatabaseCooldowns(connected);
                                            return [4 /*yield*/, cooldown_1.default.find({
                                                    name: command.names[0],
                                                    type: command.globalCooldown ? "global" : "per-user",
                                                })];
                                        case 1:
                                            results = _c.sent();
                                            // @ts-ignore
                                            for (_i = 0, results_1 = results; _i < results_1.length; _i++) {
                                                _a = results_1[_i], _id = _a._id, cooldown_2 = _a.cooldown;
                                                _b = _id.split("-"), name_1 = _b[0], guildId = _b[1], userId = _b[2];
                                                command.setCooldown(guildId, userId, cooldown_2);
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                            return [2 /*return*/];
                    }
                });
            }); });
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
        return __awaiter(this, void 0, void 0, function () {
            var configuration, _a, name, argTypes, category, commands, aliases, init, callback, execute, run, error, description, requiredPermissions, permissions, testOnly, slash, expectedArgs, minArgs, callbackCounter, names, _i, _b, perm, missing, slashCommands, options, split, a, item, _c, _d, id, hasCallback, command, _e, names_1, name_2;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        configuration = require(file);
                        // person is using 'export default' so we import the default instead
                        if (configuration.default && Object.keys(configuration).length === 1) {
                            configuration = configuration.default;
                        }
                        _a = configuration.name, name = _a === void 0 ? fileName : _a, argTypes = configuration.argTypes, category = configuration.category, commands = configuration.commands, aliases = configuration.aliases, init = configuration.init, callback = configuration.callback, execute = configuration.execute, run = configuration.run, error = configuration.error, description = configuration.description, requiredPermissions = configuration.requiredPermissions, permissions = configuration.permissions, testOnly = configuration.testOnly, slash = configuration.slash, expectedArgs = configuration.expectedArgs, minArgs = configuration.minArgs;
                        callbackCounter = 0;
                        if (callback)
                            ++callbackCounter;
                        if (execute)
                            ++callbackCounter;
                        if (run)
                            ++callbackCounter;
                        if (callbackCounter > 1) {
                            throw new Error('Commands can have "callback", "execute", or "run" functions, but not multiple.');
                        }
                        names = commands || aliases || [];
                        if (!name && (!names || names.length === 0)) {
                            throw new Error("Command located at \"" + file + "\" does not have a name, commands array, or aliases array set. Please set at lease one property to specify the command name.");
                        }
                        if (typeof names === "string") {
                            names = [names];
                        }
                        if (typeof name !== "string") {
                            throw new Error("Command located at \"" + file + "\" does not have a string as a name.");
                        }
                        if (name && !names.includes(name.toLowerCase())) {
                            names.unshift(name.toLowerCase());
                        }
                        if (requiredPermissions || permissions) {
                            for (_i = 0, _b = requiredPermissions || permissions; _i < _b.length; _i++) {
                                perm = _b[_i];
                                if (!permissions_1.permissionList.includes(perm)) {
                                    throw new Error("Command located at \"" + file + "\" has an invalid permission node: \"" + perm + "\". Permissions must be all upper case and be one of the following: \"" + __spreadArrays(permissions_1.permissionList).join('", "') + "\"");
                                }
                            }
                        }
                        missing = [];
                        if (!category) {
                            missing.push("Category");
                        }
                        if (!description) {
                            missing.push("Description");
                        }
                        if (missing.length && instance.showWarns) {
                            console.warn("WOKCommands > Command \"" + names[0] + "\" does not have the following properties: " + missing + ".");
                        }
                        if (testOnly && !instance.testServers.length) {
                            console.warn("WOKCommands > Command \"" + names[0] + "\" has \"testOnly\" set to true, but no test servers are defined.");
                        }
                        if (slash !== undefined && typeof slash !== "boolean" && slash !== "both") {
                            throw new Error("WOKCommands > Command \"" + names[0] + "\" has a \"slash\" property that is not boolean \"true\" or string \"both\".");
                        }
                        if (!slash) return [3 /*break*/, 7];
                        if (!description) {
                            throw new Error("WOKCommands > A description is required for command \"" + names[0] + "\" because it is a slash command.");
                        }
                        if (minArgs !== undefined && !expectedArgs) {
                            throw new Error("WOKCommands > Command \"" + names[0] + "\" has \"minArgs\" property defined without \"expectedArgs\" property as a slash command.");
                        }
                        if (argTypes !== undefined && argTypes.map(function (arg) { return typeof arg !== 'number'; }).reduce(function (a, b) { return a || b; })) {
                            throw new Error("WOKCommands > \"argTypes\" option must be an array of numbers");
                        }
                        slashCommands = instance.slashCommands;
                        options = [];
                        if (expectedArgs) {
                            split = expectedArgs
                                .substring(1, expectedArgs.length - 1)
                                .split(/[>\]] [<\[]/);
                            for (a = 0; a < split.length; ++a) {
                                item = split[a];
                                options.push({
                                    name: item.replace(/ /g, "-"),
                                    description: item,
                                    type: argTypes !== undefined && argTypes[a] !== undefined ? argTypes[a] : 3,
                                    required: a < minArgs,
                                });
                            }
                        }
                        if (!testOnly) return [3 /*break*/, 5];
                        _c = 0, _d = instance.testServers;
                        _f.label = 1;
                    case 1:
                        if (!(_c < _d.length)) return [3 /*break*/, 4];
                        id = _d[_c];
                        return [4 /*yield*/, slashCommands.create(names[0], description, options, id)];
                    case 2:
                        _f.sent();
                        _f.label = 3;
                    case 3:
                        _c++;
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, slashCommands.create(names[0], description, options)];
                    case 6:
                        _f.sent();
                        _f.label = 7;
                    case 7:
                        hasCallback = callback || execute || run;
                        if (hasCallback) {
                            if (init) {
                                init(client, instance);
                            }
                            command = new Command_1.default(instance, client, names, hasCallback, error, configuration);
                            for (_e = 0, names_1 = names; _e < names_1.length; _e++) {
                                name_2 = names_1[_e];
                                // Ensure the alias is lower case because we read as lower case later on
                                this._commands.set(name_2.toLowerCase(), command);
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(CommandHandler.prototype, "commands", {
        get: function () {
            var results = [];
            var added = [];
            this._commands.forEach(function (_a) {
                var names = _a.names, _b = _a.category, category = _b === void 0 ? "" : _b, _c = _a.description, description = _c === void 0 ? "" : _c, _d = _a.expectedArgs, expectedArgs = _d === void 0 ? "" : _d, _e = _a.hidden, hidden = _e === void 0 ? false : _e, _f = _a.testOnly, testOnly = _f === void 0 ? false : _f;
                if (!added.includes(names[0])) {
                    results.push({
                        names: __spreadArrays(names),
                        category: category,
                        description: description,
                        syntax: expectedArgs,
                        hidden: hidden,
                        testOnly: testOnly,
                    });
                    added.push(names[0]);
                }
            });
            return results;
        },
        enumerable: false,
        configurable: true
    });
    CommandHandler.prototype.getCommandsByCategory = function (category, visibleOnly) {
        var results = [];
        for (var _i = 0, _a = this.commands; _i < _a.length; _i++) {
            var command = _a[_i];
            if (visibleOnly && command.hidden) {
                continue;
            }
            if (command.category === category) {
                results.push(command);
            }
        }
        return results;
    };
    CommandHandler.prototype.getCommand = function (name) {
        return this._commands.get(name);
    };
    CommandHandler.prototype.getICommand = function (name) {
        return this.commands.find(function (command) { return command.names.includes(name); });
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
    CommandHandler.prototype.fetchChannelOnly = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var results, _i, results_4, result, command, guildId, channels, cmd, guild;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, channel_commands_1.default.find({})];
                    case 1:
                        results = _b.sent();
                        for (_i = 0, results_4 = results; _i < results_4.length; _i++) {
                            result = results_4[_i];
                            command = result.command, guildId = result.guildId, channels = result.channels;
                            cmd = this._commands.get(command);
                            if (!cmd) {
                                continue;
                            }
                            guild = (_a = this._client) === null || _a === void 0 ? void 0 : _a.guilds.cache.get(guildId);
                            if (!guild) {
                                continue;
                            }
                            cmd.setRequiredChannels(guild, command, channels
                                .toString()
                                .replace(/\"\[\]/g, "")
                                .split(","));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return CommandHandler;
}());
module.exports = CommandHandler;
