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
var disabled_commands_1 = __importDefault(require("../models/disabled-commands"));
module.exports = {
    minArgs: 2,
    maxArgs: 2,
    expectedArgs: '<"enable" or "disable"> <Command Name>',
    requiredPermissions: ['ADMINISTRATOR'],
    description: 'Enables or disables a command for this guild',
    callback: function (message, args, text, client, prefix, instance) { return __awaiter(void 0, void 0, void 0, function () {
        var newState, name, guild, command, mainCommand, isDisabled;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    newState = (_a = args.shift()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                    name = (args.shift() || '').toLowerCase();
                    if (newState !== 'enable' && newState !== 'disable') {
                        message.reply('The state must be either "enable" or "disable"');
                        return [2 /*return*/];
                    }
                    guild = message.guild;
                    if (!guild) {
                        message.reply('You cannot enable or disable commands in private messages');
                        return [2 /*return*/];
                    }
                    command = instance.commandHandler.getCommand(name);
                    if (!command) return [3 /*break*/, 5];
                    mainCommand = command.names[0];
                    isDisabled = command.isDisabled(guild.id);
                    if (!(newState === 'enable')) return [3 /*break*/, 2];
                    if (!isDisabled) {
                        message.reply('That command is already enabled!');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, disabled_commands_1.default.deleteOne({
                            guildId: guild.id,
                            command: mainCommand,
                        })];
                case 1:
                    _b.sent();
                    command.enable(guild.id);
                    message.reply("\"" + mainCommand + "\" is now enabled!");
                    return [3 /*break*/, 4];
                case 2:
                    if (isDisabled) {
                        message.reply('That command is already disabled!');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, new disabled_commands_1.default({
                            guildId: guild.id,
                            command: mainCommand,
                        }).save()];
                case 3:
                    _b.sent();
                    command.disable(guild.id);
                    message.reply("\"" + mainCommand + "\" is now disabled!");
                    _b.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    message.reply("Could not find command \"" + name + "\"! View all commands with \"" + instance.getPrefix(guild) + "commands\"");
                    _b.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    }); },
};
