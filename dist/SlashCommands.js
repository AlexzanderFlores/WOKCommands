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
    function SlashCommands(client) {
        this._client = client;
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
    SlashCommands.prototype.getObjectFromOptions = function (options) {
        var args = {};
        if (!options) {
            return args;
        }
        for (var _i = 0, options_1 = options; _i < options_1.length; _i++) {
            var _a = options_1[_i], name_1 = _a.name, value = _a.value;
            args[name_1] = value;
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
    return SlashCommands;
}());
module.exports = SlashCommands;
