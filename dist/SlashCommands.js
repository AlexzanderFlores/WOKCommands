"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var discord_js_1 = require("discord.js");
var SlashCommands = /** @class */ (function () {
    function SlashCommands(instance, listen) {
        var _this = this;
        if (listen === void 0) { listen = true; }
        this._instance = instance;
        this._client = instance.client;
        if (listen) {
            // @ts-ignore
            this._client.ws.on("INTERACTION_CREATE", function (interaction) { return __awaiter(_this, void 0, void 0, function () {
                var member, data, guild_id, channel_id, type, user, Appdata, name, options, command, guild, args, channel;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            member = interaction.member, data = interaction.data, guild_id = interaction.guild_id, channel_id = interaction.channel_id, type = interaction.type, user = interaction.user;
                            if (!(type === 1)) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.createInteractionResponse(interaction, 1)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                        case 2:
                            Appdata = data;
                            name = Appdata.name, options = Appdata.options;
                            command = name.toLowerCase();
                            guild = guild_id ? this._client.guilds.cache.get(guild_id) : undefined;
                            args = this.getArrayFromOptions(guild, options);
                            channel = channel_id ? guild === null || guild === void 0 ? void 0 : guild.channels.cache.get(channel_id) : undefined;
                            interaction.channel_type = user ? "DM" : "GUILD";
                            this.invokeCommand(interaction, command, args, member, guild, channel);
                            return [2 /*return*/];
                    }
                });
            }); });
        }
    }
    SlashCommands.prototype.get = function (guildId) {
        return __awaiter(this, void 0, void 0, function () {
            var app;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        app = this._client.api.applications(this._client.user.id);
                        if (guildId) {
                            app.guilds(guildId);
                        }
                        return [4 /*yield*/, app.commands.get()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SlashCommands.prototype.create = function (name, description, options, guildId) {
        if (options === void 0) { options = []; }
        return __awaiter(this, void 0, void 0, function () {
            var app;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        app = this._client.api.applications(this._client.user.id);
                        if (guildId) {
                            app.guilds(guildId);
                        }
                        return [4 /*yield*/, app.commands.post({
                                data: {
                                    name: name,
                                    description: description,
                                    options: options,
                                },
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SlashCommands.prototype.delete = function (commandId, guildId) {
        return __awaiter(this, void 0, void 0, function () {
            var app;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        app = this._client.api.applications(this._client.user.id);
                        if (guildId) {
                            app.guilds(guildId);
                        }
                        return [4 /*yield*/, app.commands(commandId).delete()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // Checks if string is a user id, if true, returns a Guild Member object
    SlashCommands.prototype.getMemberIfExists = function (value, guild) {
        if (value &&
            typeof value === "string" &&
            value.startsWith("<@!") &&
            value.endsWith(">")) {
            value = value.substring(3, value.length - 1);
            value = guild === null || guild === void 0 ? void 0 : guild.members.cache.get(value);
        }
        return value;
    };
    SlashCommands.prototype.getObjectFromOptions = function (guild, options) {
        var args = {};
        if (!options) {
            return args;
        }
        for (var _i = 0, options_1 = options; _i < options_1.length; _i++) {
            var _a = options_1[_i], name_1 = _a.name, value = _a.value;
            args[name_1] = this.getMemberIfExists(value, guild);
        }
        return args;
    };
    SlashCommands.prototype.getArrayFromOptions = function (guild, options) {
        var args = [];
        if (!options) {
            return args;
        }
        for (var _i = 0, options_2 = options; _i < options_2.length; _i++) {
            var value = options_2[_i].value;
            if (!value) {
                break;
            }
            args.push(this.getMemberIfExists(value, guild));
        }
        return args;
    };
    SlashCommands.prototype.createAPIMessage = function (interaction, content) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, files;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, discord_js_1.APIMessage.create(
                        // @ts-ignore
                        this._client.channels.resolve(interaction.channel_id), content)
                            .resolveData()
                            .resolveFiles()];
                    case 1:
                        _a = _b.sent(), data = _a.data, files = _a.files;
                        return [2 /*return*/, __assign(__assign({}, data), { files: files })];
                }
            });
        });
    };
    SlashCommands.prototype.getInteractionResponseByToken = function (application_id, token) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getInteractionResponse({ token: token, application_id: application_id })];
                    case 1: 
                    // @ts-ignore
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SlashCommands.prototype.deleteInteractionResponseByToken = function (application_id, token) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.deleteInteractionResponse({ token: token, application_id: application_id })];
                    case 1: 
                    // @ts-ignore
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SlashCommands.prototype.createInteractionResponse = function (interaction, type, data, ephemeral) {
        return __awaiter(this, void 0, void 0, function () {
            var Send;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        Send = { type: type };
                        if (data && ephemeral) {
                            data.flags = 64;
                        }
                        Send.data = data;
                        return [4 /*yield*/, this._client.api
                                // @ts-ignore
                                .interactions(interaction.id, interaction.token)
                                .callback.post({ data: Send })];
                    case 1: 
                    // @ts-ignore
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SlashCommands.prototype.getInteractionResponse = function (interaction) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._client.api
                            // @ts-ignore
                            .webhooks(interaction.application_id, interaction.token)
                            .messages["@original"].get()];
                    case 1: 
                    // @ts-ignore
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SlashCommands.prototype.editInteractionResponse = function (interaction, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._client.api
                            // @ts-ignore
                            .webhooks(interaction.application_id, interaction.token)
                            .messages["@original"].patch({ data: data })];
                    case 1: 
                    // @ts-ignore
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    //ATTENTION, if the message is ephemeral you can't delete it, only the user who got the message can see and delete it!!
    SlashCommands.prototype.deleteInteractionResponse = function (interaction) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._client.api
                            // @ts-ignore
                            .webhooks(interaction.application_id, interaction.token)
                            .messages["@original"].delete()];
                    case 1: 
                    // @ts-ignore
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SlashCommands.prototype.createFollowupMessage = function (interaction, data, ephemeral) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (data && ephemeral) {
                            data.flags = 64;
                        }
                        return [4 /*yield*/, this._client.api
                                // @ts-ignore
                                .webhooks(interaction.application_id, interaction.token)
                                .post({ data: data })];
                    case 1: 
                    // @ts-ignore
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SlashCommands.prototype.editFollowupMessage = function (interaction, data, message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._client.api
                            // @ts-ignore
                            .webhooks(interaction.application_id, interaction.token)
                            .messages(message.id).patch({ data: data })];
                    case 1: 
                    // @ts-ignore
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    //ATTENTION, if the message is ephemeral you can't delete it, only the user who got the message can see and delete it!!
    SlashCommands.prototype.deleteFollowupMessage = function (interaction, message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._client.api
                            // @ts-ignore
                            .webhooks(interaction.application_id, interaction.token)
                            .messages(message.id).delete()];
                    case 1: 
                    // @ts-ignore
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SlashCommands.prototype.invokeCommand = function (interaction, commandName, options, member, guild, channel) {
        return __awaiter(this, void 0, void 0, function () {
            var command, result, patch, embed, _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        command = this._instance.commandHandler.getCommand(commandName);
                        if (!command || !command.callback) {
                            return [2 /*return*/, false];
                        }
                        interaction.status = {};
                        interaction.delete = function () { return __awaiter(_this, void 0, void 0, function () {
                            var respond;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.deleteInteractionResponse(interaction)];
                                    case 1:
                                        respond = _a.sent();
                                        interaction.status.deletet = true;
                                        return [2 /*return*/, respond];
                                }
                            });
                        }); };
                        interaction.loading = function () { return __awaiter(_this, void 0, void 0, function () {
                            var respond, respondMessage;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.createInteractionResponse(interaction, 5)];
                                    case 1:
                                        respond = _a.sent();
                                        interaction.status.loaded = true;
                                        return [4 /*yield*/, this.getInteractionResponse(interaction)];
                                    case 2:
                                        respondMessage = _a.sent();
                                        return [2 /*return*/, respondMessage];
                                }
                            });
                        }); };
                        interaction.reply = function (data) { return __awaiter(_this, void 0, void 0, function () {
                            var DataToSend, respond, DataToSend, respond, respondMessage;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!interaction.status.loaded) return [3 /*break*/, 2];
                                        DataToSend = void 0;
                                        //TODO enable support for also passing an embed as data
                                        if (typeof data === "string") {
                                            DataToSend = { content: data };
                                        }
                                        else {
                                            DataToSend = data;
                                        }
                                        return [4 /*yield*/, this.editInteractionResponse(interaction, DataToSend)];
                                    case 1:
                                        respond = _a.sent();
                                        interaction.status.send = true;
                                        return [2 /*return*/, respond];
                                    case 2:
                                        if (!!interaction.status.send) return [3 /*break*/, 5];
                                        DataToSend = void 0;
                                        //TODO enable support for also passing an embed as data
                                        if (typeof data === "string") {
                                            DataToSend = { content: data };
                                        }
                                        else {
                                            DataToSend = data;
                                        }
                                        return [4 /*yield*/, this.createInteractionResponse(interaction, 4, DataToSend)];
                                    case 3:
                                        respond = _a.sent();
                                        interaction.status.send = true;
                                        return [4 /*yield*/, this.getInteractionResponse(interaction)];
                                    case 4:
                                        respondMessage = _a.sent();
                                        return [2 /*return*/, respondMessage];
                                    case 5:
                                        console.error("WOKCommands > Interaction \"" + interaction.id + "\" loaded and send the message already");
                                        return [2 /*return*/, Promise.reject("WOKCommands > Interaction \"" + interaction.id + "\" loaded and send the message already")];
                                }
                            });
                        }); };
                        interaction.edit = function (data) { return __awaiter(_this, void 0, void 0, function () {
                            var DataToSend, respond;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        //TODO enable support for also passing an embed as data
                                        if (typeof data === "string") {
                                            DataToSend = { content: data };
                                        }
                                        else {
                                            DataToSend = data;
                                        }
                                        return [4 /*yield*/, this.editInteractionResponse(interaction, DataToSend)];
                                    case 1:
                                        respond = _a.sent();
                                        interaction.status.send = true;
                                        return [2 /*return*/, respond];
                                }
                            });
                        }); };
                        interaction.followUpMessages = { create: this.createFollowupMessage, delete: this.deleteFollowupMessage, edit: this.editFollowupMessage };
                        return [4 /*yield*/, command.callback({
                                member: member,
                                guild: guild,
                                channel: channel,
                                args: options,
                                // @ts-ignore
                                text: options.join ? options.join(" ") : "",
                                client: this._client,
                                instance: this._instance,
                                interaction: interaction,
                            })];
                    case 1:
                        result = _b.sent();
                        if (interaction.status.send) {
                            return [2 /*return*/, true];
                        }
                        if (interaction.status.loaded) {
                            console.error("WOKCommands > Command \"" + commandName + "\" used loading, but not send, thats a mi of old and new methods, switch fully to the new ones to fix this");
                            return [2 /*return*/, false];
                        }
                        if (!result && !interaction.status.send) {
                            console.error("WOKCommands > Command \"" + commandName + "\" didn't send anything, and didn't return a value as fallback action");
                            return [2 /*return*/, false];
                        }
                        if (interaction.status.deletet && result) {
                            console.error("WOKCommands > Command \"" + commandName + "\" the interaction response was already deletet");
                            return [2 /*return*/, false];
                        }
                        if (result) {
                            console.warn("WOKCommands > Command \"" + commandName + "\" returned something from the callback, this is deprecated and will be removed later on");
                        }
                        patch = {};
                        if (!(typeof result === "object")) return [3 /*break*/, 3];
                        embed = new discord_js_1.MessageEmbed(result);
                        // @ts-ignore
                        _a = patch;
                        return [4 /*yield*/, this.createAPIMessage(interaction, embed)];
                    case 2:
                        // @ts-ignore
                        _a.embeds = [(_b.sent())];
                        return [3 /*break*/, 4];
                    case 3:
                        patch.content = result;
                        _b.label = 4;
                    case 4:
                        this.createInteractionResponse(interaction, 4, patch);
                        return [2 /*return*/, true];
                }
            });
        });
    };
    return SlashCommands;
}());
module.exports = SlashCommands;
