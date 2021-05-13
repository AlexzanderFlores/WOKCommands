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
var permissions_1 = require("./permissions");
var CommandErrors_1 = __importDefault(require("./enums/CommandErrors"));
var Events_1 = __importDefault(require("./enums/Events"));
var CommandHandler = /** @class */ (function () {
    function CommandHandler(instance, client, dir, disabledDefaultCommands) {
        var _this = this;
        this._commands = new Map();
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
                var startsWithEmoji = _this.startsWithEmoji(content);
                if (!content.startsWith(prefix) && !startsWithEmoji) {
                    return;
                }
                if (instance.ignoreBots && message.author.bot) {
                    return;
                }
                // Remove the prefix, if not an emoji
                content = startsWithEmoji ? content : content.substring(prefix.length);
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
            instance.on(Events_1.default.DATABASE_CONNECTED, function (connection, state) {
                _this._commands.forEach(function (command) { return __awaiter(_this, void 0, void 0, function () {
                    var connected, results, _i, results_1, _a, _id, cooldown_2, _b, name_1, guildId, userId;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                connected = state === "Connected";
                                command.verifyDatabaseCooldowns(connected);
                                if (!connected) {
                                    return [2 /*return*/];
                                }
                                // Load previously used cooldowns
                                return [4 /*yield*/, this.fetchDisabledCommands()];
                            case 1:
                                // Load previously used cooldowns
                                _c.sent();
                                return [4 /*yield*/, this.fetchRequiredRoles()];
                            case 2:
                                _c.sent();
                                return [4 /*yield*/, cooldown_1.default.find({
                                        name: command.names[0],
                                        type: command.globalCooldown ? "global" : "per-user",
                                    })];
                            case 3:
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
            });
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
            var configuration, _a, name, category, commands, aliases, init, callback, execute, run, error, description, requiredPermissions, permissions, testOnly, slash, expectedArgs, minArgs, callbackCounter, names, _i, _b, perm, missing, slashCommands, options, split, a, item, _c, _d, id, hasCallback, command, _e, names_1, name_2, emoji, customEmoji;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        configuration = require(file);
                        // person is using 'export default' so we import the default instead
                        if (configuration.default && Object.keys(configuration).length === 1) {
                            configuration = configuration.default;
                        }
                        _a = configuration.name, name = _a === void 0 ? fileName : _a, category = configuration.category, commands = configuration.commands, aliases = configuration.aliases, init = configuration.init, callback = configuration.callback, execute = configuration.execute, run = configuration.run, error = configuration.error, description = configuration.description, requiredPermissions = configuration.requiredPermissions, permissions = configuration.permissions, testOnly = configuration.testOnly, slash = configuration.slash, expectedArgs = configuration.expectedArgs, minArgs = configuration.minArgs;
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
                                    type: 3,
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
                                //Emojis Handler for Commands, since matching a string for an emoji is pretty complicated(regex, emojis can be multiple concatenated), we have to provide an object!!!
                                //after writing the startsWithEmoji function, it would be possible, but with objects we can specifiy the customEmoji property, possibl that we move out of aliases then we could use detection without object (inlcude "id" to custom emojis, possibe to genearte emoji from :banana: to 🍌 from sending and reading it from discord)
                                if (typeof name_2 === "object") {
                                    emoji = name_2.emoji, customEmoji = name_2.customEmoji;
                                    if (!emoji) {
                                        break;
                                    }
                                    if (emoji.startsWith("<:") && emoji.endsWith(">")) {
                                        customEmoji = true;
                                        emoji = emoji.split(":")[2];
                                        emoji = emoji.substring(0, emoji.length - 1);
                                        if (customEmoji) {
                                            emoji = client.emojis.cache.get(emoji);
                                            if (!emoji) {
                                                console.warn("WOKCommands > The Custom emoji \"" + name_2.emoji + "\" is invalid or not accesible by the bot.");
                                                break;
                                            }
                                        }
                                    }
                                    this._commands.set(name_2.emoji, command);
                                }
                                else {
                                    this._commands.set(name_2.toLowerCase(), command);
                                }
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    CommandHandler.prototype.startsWithEmoji = function (content) {
        var regex = /<:(\w+):(\d+)>/g;
        var iterator = content.match(regex) || [];
        var matches = __spreadArrays(iterator);
        if ((matches === null || matches === void 0 ? void 0 : matches.length) > 0) {
            if (content.startsWith(matches[0][0])) {
                var emoji = { name: matches[0][1], id: matches[0][2], customEmoji: true };
                return true;
            }
        }
        //TODO: check all reserved emoji codepoints, as lised here: http://www.unicode.org/Public/emoji/12.0/ 
        //"stolen" from https://github.com/mathiasbynens/emoji-regex
        var emojiRegexp = /\u{1F3F4}\u{E0067}\u{E0062}(?:\u{E0077}\u{E006C}\u{E0073}|\u{E0073}\u{E0063}\u{E0074}|\u{E0065}\u{E006E}\u{E0067})\u{E007F}|(?:\u{1F9D1}\u{1F3FF}\u200D\u2764\uFE0F\u200D(?:\u{1F48B}\u200D)?\u{1F9D1}|\u{1F469}\u{1F3FF}\u200D\u{1F91D}\u200D[\u{1F468}\u{1F469}])[\u{1F3FB}-\u{1F3FE}]|(?:\u{1F9D1}\u{1F3FE}\u200D\u2764\uFE0F\u200D(?:\u{1F48B}\u200D)?\u{1F9D1}|\u{1F469}\u{1F3FE}\u200D\u{1F91D}\u200D[\u{1F468}\u{1F469}])[\u{1F3FB}-\u{1F3FD}\u{1F3FF}]|(?:\u{1F9D1}\u{1F3FD}\u200D\u2764\uFE0F\u200D(?:\u{1F48B}\u200D)?\u{1F9D1}|\u{1F469}\u{1F3FD}\u200D\u{1F91D}\u200D[\u{1F468}\u{1F469}])[\u{1F3FB}\u{1F3FC}\u{1F3FE}\u{1F3FF}]|(?:\u{1F9D1}\u{1F3FC}\u200D\u2764\uFE0F\u200D(?:\u{1F48B}\u200D)?\u{1F9D1}|\u{1F469}\u{1F3FC}\u200D\u{1F91D}\u200D[\u{1F468}\u{1F469}])[\u{1F3FB}\u{1F3FD}-\u{1F3FF}]|(?:\u{1F9D1}\u{1F3FB}\u200D\u2764\uFE0F\u200D(?:\u{1F48B}\u200D)?\u{1F9D1}|\u{1F469}\u{1F3FB}\u200D\u{1F91D}\u200D[\u{1F468}\u{1F469}])[\u{1F3FC}-\u{1F3FF}]|\u{1F468}(?:\u{1F3FB}(?:\u200D(?:\u2764\uFE0F\u200D(?:\u{1F48B}\u200D\u{1F468}[\u{1F3FB}-\u{1F3FF}]|\u{1F468}[\u{1F3FB}-\u{1F3FF}])|\u{1F91D}\u200D\u{1F468}[\u{1F3FC}-\u{1F3FF}]|[\u2695\u2696\u2708]\uFE0F|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]))?|[\u{1F3FC}-\u{1F3FF}]\u200D\u2764\uFE0F\u200D(?:\u{1F48B}\u200D\u{1F468}[\u{1F3FB}-\u{1F3FF}]|\u{1F468}[\u{1F3FB}-\u{1F3FF}])|\u200D(?:\u2764\uFE0F\u200D(?:\u{1F48B}\u200D)?\u{1F468}|[\u{1F468}\u{1F469}]\u200D(?:\u{1F466}\u200D\u{1F466}|\u{1F467}\u200D[\u{1F466}\u{1F467}])|\u{1F466}\u200D\u{1F466}|\u{1F467}\u200D[\u{1F466}\u{1F467}]|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F3FF}\u200D(?:\u{1F91D}\u200D\u{1F468}[\u{1F3FB}-\u{1F3FE}]|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F3FE}\u200D(?:\u{1F91D}\u200D\u{1F468}[\u{1F3FB}-\u{1F3FD}\u{1F3FF}]|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F3FD}\u200D(?:\u{1F91D}\u200D\u{1F468}[\u{1F3FB}\u{1F3FC}\u{1F3FE}\u{1F3FF}]|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F3FC}\u200D(?:\u{1F91D}\u200D\u{1F468}[\u{1F3FB}\u{1F3FD}-\u{1F3FF}]|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|(?:\u{1F3FF}\u200D[\u2695\u2696\u2708]|\u{1F3FE}\u200D[\u2695\u2696\u2708]|\u{1F3FD}\u200D[\u2695\u2696\u2708]|\u{1F3FC}\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])\uFE0F|\u200D(?:[\u{1F468}\u{1F469}]\u200D[\u{1F466}\u{1F467}]|[\u{1F466}\u{1F467}])|\u{1F3FF}|\u{1F3FE}|\u{1F3FD}|\u{1F3FC})?|(?:\u{1F469}(?:\u{1F3FB}\u200D\u2764\uFE0F\u200D(?:\u{1F48B}\u200D[\u{1F468}\u{1F469}]|[\u{1F468}\u{1F469}])|[\u{1F3FC}-\u{1F3FF}]\u200D\u2764\uFE0F\u200D(?:\u{1F48B}\u200D[\u{1F468}\u{1F469}]|[\u{1F468}\u{1F469}]))|\u{1F9D1}[\u{1F3FB}-\u{1F3FF}]\u200D\u{1F91D}\u200D\u{1F9D1})[\u{1F3FB}-\u{1F3FF}]|\u{1F469}\u200D\u{1F469}\u200D(?:\u{1F466}\u200D\u{1F466}|\u{1F467}\u200D[\u{1F466}\u{1F467}])|\u{1F469}(?:\u200D(?:\u2764\uFE0F\u200D(?:\u{1F48B}\u200D[\u{1F468}\u{1F469}]|[\u{1F468}\u{1F469}])|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F3FF}\u200D[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]|\u{1F3FE}\u200D[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]|\u{1F3FD}\u200D[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]|\u{1F3FC}\u200D[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]|\u{1F3FB}\u200D[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F9D1}(?:\u200D(?:\u{1F91D}\u200D\u{1F9D1}|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F384}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F3FF}\u200D[\u{1F33E}\u{1F373}\u{1F37C}\u{1F384}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]|\u{1F3FE}\u200D[\u{1F33E}\u{1F373}\u{1F37C}\u{1F384}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]|\u{1F3FD}\u200D[\u{1F33E}\u{1F373}\u{1F37C}\u{1F384}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]|\u{1F3FC}\u200D[\u{1F33E}\u{1F373}\u{1F37C}\u{1F384}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]|\u{1F3FB}\u200D[\u{1F33E}\u{1F373}\u{1F37C}\u{1F384}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F469}\u200D\u{1F466}\u200D\u{1F466}|\u{1F469}\u200D\u{1F469}\u200D[\u{1F466}\u{1F467}]|\u{1F469}\u200D\u{1F467}\u200D[\u{1F466}\u{1F467}]|(?:\u{1F441}\uFE0F\u200D\u{1F5E8}|\u{1F9D1}(?:\u{1F3FF}\u200D[\u2695\u2696\u2708]|\u{1F3FE}\u200D[\u2695\u2696\u2708]|\u{1F3FD}\u200D[\u2695\u2696\u2708]|\u{1F3FC}\u200D[\u2695\u2696\u2708]|\u{1F3FB}\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\u{1F469}(?:\u{1F3FF}\u200D[\u2695\u2696\u2708]|\u{1F3FE}\u200D[\u2695\u2696\u2708]|\u{1F3FD}\u200D[\u2695\u2696\u2708]|\u{1F3FC}\u200D[\u2695\u2696\u2708]|\u{1F3FB}\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\u{1F636}\u200D\u{1F32B}|\u{1F3F3}\uFE0F\u200D\u26A7|\u{1F43B}\u200D\u2744|(?:[\u{1F3C3}\u{1F3C4}\u{1F3CA}\u{1F46E}\u{1F470}\u{1F471}\u{1F473}\u{1F477}\u{1F481}\u{1F482}\u{1F486}\u{1F487}\u{1F645}-\u{1F647}\u{1F64B}\u{1F64D}\u{1F64E}\u{1F6A3}\u{1F6B4}-\u{1F6B6}\u{1F926}\u{1F935}\u{1F937}-\u{1F939}\u{1F93D}\u{1F93E}\u{1F9B8}\u{1F9B9}\u{1F9CD}-\u{1F9CF}\u{1F9D4}\u{1F9D6}-\u{1F9DD}][\u{1F3FB}-\u{1F3FF}]|[\u{1F46F}\u{1F93C}\u{1F9DE}\u{1F9DF}])\u200D[\u2640\u2642]|[\u26F9\u{1F3CB}\u{1F3CC}\u{1F575}][\uFE0F\u{1F3FB}-\u{1F3FF}]\u200D[\u2640\u2642]|\u{1F3F4}\u200D\u2620|[\u{1F3C3}\u{1F3C4}\u{1F3CA}\u{1F46E}\u{1F470}\u{1F471}\u{1F473}\u{1F477}\u{1F481}\u{1F482}\u{1F486}\u{1F487}\u{1F645}-\u{1F647}\u{1F64B}\u{1F64D}\u{1F64E}\u{1F6A3}\u{1F6B4}-\u{1F6B6}\u{1F926}\u{1F935}\u{1F937}-\u{1F939}\u{1F93D}\u{1F93E}\u{1F9B8}\u{1F9B9}\u{1F9CD}-\u{1F9CF}\u{1F9D4}\u{1F9D6}-\u{1F9DD}]\u200D[\u2640\u2642]|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u2600-\u2604\u260E\u2611\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26B0\u26B1\u26C8\u26CF\u26D1\u26D3\u26E9\u26F0\u26F1\u26F4\u26F7\u26F8\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u3030\u303D\u3297\u3299\u{1F170}\u{1F171}\u{1F17E}\u{1F17F}\u{1F202}\u{1F237}\u{1F321}\u{1F324}-\u{1F32C}\u{1F336}\u{1F37D}\u{1F396}\u{1F397}\u{1F399}-\u{1F39B}\u{1F39E}\u{1F39F}\u{1F3CD}\u{1F3CE}\u{1F3D4}-\u{1F3DF}\u{1F3F5}\u{1F3F7}\u{1F43F}\u{1F4FD}\u{1F549}\u{1F54A}\u{1F56F}\u{1F570}\u{1F573}\u{1F576}-\u{1F579}\u{1F587}\u{1F58A}-\u{1F58D}\u{1F5A5}\u{1F5A8}\u{1F5B1}\u{1F5B2}\u{1F5BC}\u{1F5C2}-\u{1F5C4}\u{1F5D1}-\u{1F5D3}\u{1F5DC}-\u{1F5DE}\u{1F5E1}\u{1F5E3}\u{1F5E8}\u{1F5EF}\u{1F5F3}\u{1F5FA}\u{1F6CB}\u{1F6CD}-\u{1F6CF}\u{1F6E0}-\u{1F6E5}\u{1F6E9}\u{1F6F0}\u{1F6F3}])\uFE0F|\u{1F3F3}\uFE0F\u200D\u{1F308}|\u{1F469}\u200D\u{1F467}|\u{1F469}\u200D\u{1F466}|\u{1F635}\u200D\u{1F4AB}|\u{1F62E}\u200D\u{1F4A8}|\u{1F415}\u200D\u{1F9BA}|\u{1F9D1}(?:\u{1F3FF}|\u{1F3FE}|\u{1F3FD}|\u{1F3FC}|\u{1F3FB})?|\u{1F469}(?:\u{1F3FF}|\u{1F3FE}|\u{1F3FD}|\u{1F3FC}|\u{1F3FB})?|\u{1F1FD}\u{1F1F0}|\u{1F1F6}\u{1F1E6}|\u{1F1F4}\u{1F1F2}|\u{1F408}\u200D\u2B1B|\u2764\uFE0F\u200D[\u{1F525}\u{1FA79}]|\u{1F441}\uFE0F|\u{1F3F3}\uFE0F|\u{1F1FF}[\u{1F1E6}\u{1F1F2}\u{1F1FC}]|\u{1F1FE}[\u{1F1EA}\u{1F1F9}]|\u{1F1FC}[\u{1F1EB}\u{1F1F8}]|\u{1F1FB}[\u{1F1E6}\u{1F1E8}\u{1F1EA}\u{1F1EC}\u{1F1EE}\u{1F1F3}\u{1F1FA}]|\u{1F1FA}[\u{1F1E6}\u{1F1EC}\u{1F1F2}\u{1F1F3}\u{1F1F8}\u{1F1FE}\u{1F1FF}]|\u{1F1F9}[\u{1F1E6}\u{1F1E8}\u{1F1E9}\u{1F1EB}-\u{1F1ED}\u{1F1EF}-\u{1F1F4}\u{1F1F7}\u{1F1F9}\u{1F1FB}\u{1F1FC}\u{1F1FF}]|\u{1F1F8}[\u{1F1E6}-\u{1F1EA}\u{1F1EC}-\u{1F1F4}\u{1F1F7}-\u{1F1F9}\u{1F1FB}\u{1F1FD}-\u{1F1FF}]|\u{1F1F7}[\u{1F1EA}\u{1F1F4}\u{1F1F8}\u{1F1FA}\u{1F1FC}]|\u{1F1F5}[\u{1F1E6}\u{1F1EA}-\u{1F1ED}\u{1F1F0}-\u{1F1F3}\u{1F1F7}-\u{1F1F9}\u{1F1FC}\u{1F1FE}]|\u{1F1F3}[\u{1F1E6}\u{1F1E8}\u{1F1EA}-\u{1F1EC}\u{1F1EE}\u{1F1F1}\u{1F1F4}\u{1F1F5}\u{1F1F7}\u{1F1FA}\u{1F1FF}]|\u{1F1F2}[\u{1F1E6}\u{1F1E8}-\u{1F1ED}\u{1F1F0}-\u{1F1FF}]|\u{1F1F1}[\u{1F1E6}-\u{1F1E8}\u{1F1EE}\u{1F1F0}\u{1F1F7}-\u{1F1FB}\u{1F1FE}]|\u{1F1F0}[\u{1F1EA}\u{1F1EC}-\u{1F1EE}\u{1F1F2}\u{1F1F3}\u{1F1F5}\u{1F1F7}\u{1F1FC}\u{1F1FE}\u{1F1FF}]|\u{1F1EF}[\u{1F1EA}\u{1F1F2}\u{1F1F4}\u{1F1F5}]|\u{1F1EE}[\u{1F1E8}-\u{1F1EA}\u{1F1F1}-\u{1F1F4}\u{1F1F6}-\u{1F1F9}]|\u{1F1ED}[\u{1F1F0}\u{1F1F2}\u{1F1F3}\u{1F1F7}\u{1F1F9}\u{1F1FA}]|\u{1F1EC}[\u{1F1E6}\u{1F1E7}\u{1F1E9}-\u{1F1EE}\u{1F1F1}-\u{1F1F3}\u{1F1F5}-\u{1F1FA}\u{1F1FC}\u{1F1FE}]|\u{1F1EB}[\u{1F1EE}-\u{1F1F0}\u{1F1F2}\u{1F1F4}\u{1F1F7}]|\u{1F1EA}[\u{1F1E6}\u{1F1E8}\u{1F1EA}\u{1F1EC}\u{1F1ED}\u{1F1F7}-\u{1F1FA}]|\u{1F1E9}[\u{1F1EA}\u{1F1EC}\u{1F1EF}\u{1F1F0}\u{1F1F2}\u{1F1F4}\u{1F1FF}]|\u{1F1E8}[\u{1F1E6}\u{1F1E8}\u{1F1E9}\u{1F1EB}-\u{1F1EE}\u{1F1F0}-\u{1F1F5}\u{1F1F7}\u{1F1FA}-\u{1F1FF}]|\u{1F1E7}[\u{1F1E6}\u{1F1E7}\u{1F1E9}-\u{1F1EF}\u{1F1F1}-\u{1F1F4}\u{1F1F6}-\u{1F1F9}\u{1F1FB}\u{1F1FC}\u{1F1FE}\u{1F1FF}]|\u{1F1E6}[\u{1F1E8}-\u{1F1EC}\u{1F1EE}\u{1F1F1}\u{1F1F2}\u{1F1F4}\u{1F1F6}-\u{1F1FA}\u{1F1FC}\u{1F1FD}\u{1F1FF}]|[#\*0-9]\uFE0F\u20E3|\u2764\uFE0F|[\u{1F3C3}\u{1F3C4}\u{1F3CA}\u{1F46E}\u{1F470}\u{1F471}\u{1F473}\u{1F477}\u{1F481}\u{1F482}\u{1F486}\u{1F487}\u{1F645}-\u{1F647}\u{1F64B}\u{1F64D}\u{1F64E}\u{1F6A3}\u{1F6B4}-\u{1F6B6}\u{1F926}\u{1F935}\u{1F937}-\u{1F939}\u{1F93D}\u{1F93E}\u{1F9B8}\u{1F9B9}\u{1F9CD}-\u{1F9CF}\u{1F9D4}\u{1F9D6}-\u{1F9DD}][\u{1F3FB}-\u{1F3FF}]|[\u26F9\u{1F3CB}\u{1F3CC}\u{1F575}][\uFE0F\u{1F3FB}-\u{1F3FF}]|\u{1F3F4}|[\u270A\u270B\u{1F385}\u{1F3C2}\u{1F3C7}\u{1F442}\u{1F443}\u{1F446}-\u{1F450}\u{1F466}\u{1F467}\u{1F46B}-\u{1F46D}\u{1F472}\u{1F474}-\u{1F476}\u{1F478}\u{1F47C}\u{1F483}\u{1F485}\u{1F48F}\u{1F491}\u{1F4AA}\u{1F57A}\u{1F595}\u{1F596}\u{1F64C}\u{1F64F}\u{1F6C0}\u{1F6CC}\u{1F90C}\u{1F90F}\u{1F918}-\u{1F91C}\u{1F91E}\u{1F91F}\u{1F930}-\u{1F934}\u{1F936}\u{1F977}\u{1F9B5}\u{1F9B6}\u{1F9BB}\u{1F9D2}\u{1F9D3}\u{1F9D5}][\u{1F3FB}-\u{1F3FF}]|[\u261D\u270C\u270D\u{1F574}\u{1F590}][\uFE0F\u{1F3FB}-\u{1F3FF}]|[\u270A\u270B\u{1F385}\u{1F3C2}\u{1F3C7}\u{1F408}\u{1F415}\u{1F43B}\u{1F442}\u{1F443}\u{1F446}-\u{1F450}\u{1F466}\u{1F467}\u{1F46B}-\u{1F46D}\u{1F472}\u{1F474}-\u{1F476}\u{1F478}\u{1F47C}\u{1F483}\u{1F485}\u{1F48F}\u{1F491}\u{1F4AA}\u{1F57A}\u{1F595}\u{1F596}\u{1F62E}\u{1F635}\u{1F636}\u{1F64C}\u{1F64F}\u{1F6C0}\u{1F6CC}\u{1F90C}\u{1F90F}\u{1F918}-\u{1F91C}\u{1F91E}\u{1F91F}\u{1F930}-\u{1F934}\u{1F936}\u{1F977}\u{1F9B5}\u{1F9B6}\u{1F9BB}\u{1F9D2}\u{1F9D3}\u{1F9D5}]|[\u{1F3C3}\u{1F3C4}\u{1F3CA}\u{1F46E}\u{1F470}\u{1F471}\u{1F473}\u{1F477}\u{1F481}\u{1F482}\u{1F486}\u{1F487}\u{1F645}-\u{1F647}\u{1F64B}\u{1F64D}\u{1F64E}\u{1F6A3}\u{1F6B4}-\u{1F6B6}\u{1F926}\u{1F935}\u{1F937}-\u{1F939}\u{1F93D}\u{1F93E}\u{1F9B8}\u{1F9B9}\u{1F9CD}-\u{1F9CF}\u{1F9D4}\u{1F9D6}-\u{1F9DD}]|[\u{1F46F}\u{1F93C}\u{1F9DE}\u{1F9DF}]|[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55\u{1F004}\u{1F0CF}\u{1F18E}\u{1F191}-\u{1F19A}\u{1F201}\u{1F21A}\u{1F22F}\u{1F232}-\u{1F236}\u{1F238}-\u{1F23A}\u{1F250}\u{1F251}\u{1F300}-\u{1F320}\u{1F32D}-\u{1F335}\u{1F337}-\u{1F37C}\u{1F37E}-\u{1F384}\u{1F386}-\u{1F393}\u{1F3A0}-\u{1F3C1}\u{1F3C5}\u{1F3C6}\u{1F3C8}\u{1F3C9}\u{1F3CF}-\u{1F3D3}\u{1F3E0}-\u{1F3F0}\u{1F3F8}-\u{1F407}\u{1F409}-\u{1F414}\u{1F416}-\u{1F43A}\u{1F43C}-\u{1F43E}\u{1F440}\u{1F444}\u{1F445}\u{1F451}-\u{1F465}\u{1F46A}\u{1F479}-\u{1F47B}\u{1F47D}-\u{1F480}\u{1F484}\u{1F488}-\u{1F48E}\u{1F490}\u{1F492}-\u{1F4A9}\u{1F4AB}-\u{1F4FC}\u{1F4FF}-\u{1F53D}\u{1F54B}-\u{1F54E}\u{1F550}-\u{1F567}\u{1F5A4}\u{1F5FB}-\u{1F62D}\u{1F62F}-\u{1F634}\u{1F637}-\u{1F644}\u{1F648}-\u{1F64A}\u{1F680}-\u{1F6A2}\u{1F6A4}-\u{1F6B3}\u{1F6B7}-\u{1F6BF}\u{1F6C1}-\u{1F6C5}\u{1F6D0}-\u{1F6D2}\u{1F6D5}-\u{1F6D7}\u{1F6EB}\u{1F6EC}\u{1F6F4}-\u{1F6FC}\u{1F7E0}-\u{1F7EB}\u{1F90D}\u{1F90E}\u{1F910}-\u{1F917}\u{1F91D}\u{1F920}-\u{1F925}\u{1F927}-\u{1F92F}\u{1F93A}\u{1F93F}-\u{1F945}\u{1F947}-\u{1F976}\u{1F978}\u{1F97A}-\u{1F9B4}\u{1F9B7}\u{1F9BA}\u{1F9BC}-\u{1F9CB}\u{1F9D0}\u{1F9E0}-\u{1F9FF}\u{1FA70}-\u{1FA74}\u{1FA78}-\u{1FA7A}\u{1FA80}-\u{1FA86}\u{1FA90}-\u{1FAA8}\u{1FAB0}-\u{1FAB6}\u{1FAC0}-\u{1FAC2}\u{1FAD0}-\u{1FAD6}]/gu;
        var iteratorEmojis = content.match(emojiRegexp) || [];
        var emojiMatches = __spreadArrays(iteratorEmojis);
        if ((emojiMatches === null || emojiMatches === void 0 ? void 0 : emojiMatches.length) > 0) {
            if (content.startsWith(emojiMatches[0][0])) {
                var emoji = { name: emojiMatches[0][1] };
                return true;
            }
        }
        return false;
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
    return CommandHandler;
}());
module.exports = CommandHandler;
