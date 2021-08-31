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
var SlashCommands = /** @class */ (function () {
    function SlashCommands(instance, listen) {
        var _this = this;
        if (listen === void 0) { listen = true; }
        this._instance = instance;
        this._client = instance.client;
        if (listen) {
            this._client.on('interactionCreate', function (interaction) { return __awaiter(_this, void 0, void 0, function () {
                var member, commandName, options, guildId, channelId, command, guild, channel;
                return __generator(this, function (_a) {
                    if (!interaction.isCommand()) {
                        return [2 /*return*/];
                    }
                    member = interaction.member, commandName = interaction.commandName, options = interaction.options, guildId = interaction.guildId, channelId = interaction.channelId;
                    command = commandName;
                    guild = this._client.guilds.cache.get(guildId || '') || null;
                    channel = (guild === null || guild === void 0 ? void 0 : guild.channels.cache.get(channelId)) || null;
                    this.invokeCommand(interaction, command, options, member, guild, channel);
                    return [2 /*return*/];
                });
            }); });
        }
    }
    SlashCommands.prototype.getCommands = function (guildId) {
        var _a, _b;
        if (guildId) {
            return (_a = this._client.guilds.cache.get(guildId)) === null || _a === void 0 ? void 0 : _a.commands;
        }
        return (_b = this._client.application) === null || _b === void 0 ? void 0 : _b.commands;
    };
    SlashCommands.prototype.get = function (guildId) {
        return __awaiter(this, void 0, void 0, function () {
            var commands;
            return __generator(this, function (_a) {
                commands = this.getCommands(guildId);
                if (commands) {
                    return [2 /*return*/, commands.cache];
                }
                return [2 /*return*/, new Map()];
            });
        });
    };
    SlashCommands.prototype.create = function (name, description, options, guildId) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var commands;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (guildId) {
                            commands = (_a = this._client.guilds.cache.get(guildId)) === null || _a === void 0 ? void 0 : _a.commands;
                        }
                        else {
                            commands = (_b = this._client.application) === null || _b === void 0 ? void 0 : _b.commands;
                        }
                        if (!commands) return [3 /*break*/, 2];
                        return [4 /*yield*/, commands.create({
                                name: name,
                                description: description,
                                options: options,
                            })];
                    case 1: return [2 /*return*/, _c.sent()];
                    case 2: return [2 /*return*/, Promise.resolve(undefined)];
                }
            });
        });
    };
    SlashCommands.prototype.delete = function (commandId, guildId) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var commands;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        commands = this.getCommands(guildId);
                        if (!commands) return [3 /*break*/, 2];
                        return [4 /*yield*/, ((_a = commands.cache.get(commandId)) === null || _a === void 0 ? void 0 : _a.delete())];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2: return [2 /*return*/, Promise.resolve(undefined)];
                }
            });
        });
    };
    SlashCommands.prototype.invokeCommand = function (interaction, commandName, options, member, guild, channel) {
        return __awaiter(this, void 0, void 0, function () {
            var command, args, reply, embeds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        command = this._instance.commandHandler.getCommand(commandName);
                        if (!command || !command.callback) {
                            return [2 /*return*/];
                        }
                        args = [];
                        options.data.forEach(function (_a) {
                            var value = _a.value;
                            args.push(String(value));
                        });
                        return [4 /*yield*/, command.callback({
                                member: member,
                                guild: guild,
                                channel: channel,
                                args: args,
                                text: args.join(' '),
                                client: this._client,
                                instance: this._instance,
                                interaction: interaction,
                                options: options,
                            })];
                    case 1:
                        reply = _a.sent();
                        if (reply) {
                            if (typeof reply === 'string') {
                                interaction.reply({
                                    content: reply,
                                });
                            }
                            else {
                                embeds = [];
                                if (Array.isArray(reply)) {
                                    embeds = reply;
                                }
                                else {
                                    embeds.push(reply);
                                }
                                interaction.reply({ embeds: embeds });
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return SlashCommands;
}());
module.exports = SlashCommands;
