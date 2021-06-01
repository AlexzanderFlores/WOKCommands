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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var channel_commands_1 = __importDefault(require("../models/channel-commands"));
module.exports = {
    minArgs: 1,
    expectedArgs: '<Command name> [Channel tags OR "none"]',
    cooldown: "2s",
    requiredPermissions: ["ADMINISTRATOR"],
    guildOnly: true,
    description: "Makes a command only work in some channels.",
    category: "Configuration",
    callback: function (options) { return __awaiter(void 0, void 0, void 0, function () {
        var message, args, instance, guild, messageHandler, commandName, command, action, results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    message = options.message, args = options.args, instance = options.instance;
                    guild = message.guild;
                    messageHandler = instance.messageHandler;
                    commandName = (args.shift() || "").toLowerCase();
                    command = instance.commandHandler.getICommand(commandName);
                    if (!command) {
                        message.reply(messageHandler.get(guild, "UNKNOWN_COMMAND", {
                            COMMAND: commandName,
                        }));
                        return [2 /*return*/];
                    }
                    commandName = command.names[0];
                    action = args[0];
                    if (!(action && action.toLowerCase() === "none")) return [3 /*break*/, 2];
                    return [4 /*yield*/, channel_commands_1.default.deleteMany({
                            guildId: guild === null || guild === void 0 ? void 0 : guild.id,
                            command: commandName,
                        })];
                case 1:
                    results = _a.sent();
                    if (results.n === 0) {
                        message.reply(messageHandler.get(guild, "NOT_CHANNEL_COMMAND"));
                    }
                    else {
                        message.reply(messageHandler.get(guild, "NO_LONGER_CHANNEL_COMMAND"));
                    }
                    return [2 /*return*/];
                case 2:
                    if (message.mentions.channels.size === 0) {
                        message.reply(messageHandler.get(guild, "NO_TAGGED_CHANNELS"));
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, channel_commands_1.default.findOneAndUpdate({
                            guildId: guild === null || guild === void 0 ? void 0 : guild.id,
                            command: commandName,
                        }, {
                            guildId: guild === null || guild === void 0 ? void 0 : guild.id,
                            command: commandName,
                            $addToSet: {
                                channels: Array.from(message.mentions.channels.keys()),
                            },
                        }, {
                            upsert: true,
                        })];
                case 3:
                    _a.sent();
                    message.reply(messageHandler.get(guild, "NOW_CHANNEL_COMMAND", {
                        COMMAND: commandName,
                        CHANNELS: args.join(" "),
                    }));
                    return [2 /*return*/];
            }
        });
    }); },
};
