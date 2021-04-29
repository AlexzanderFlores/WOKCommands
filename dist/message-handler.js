"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var languages_1 = __importDefault(require("./models/languages"));
var messages_json_1 = __importDefault(require("./messages.json"));
var Events_1 = __importDefault(require("./enums/Events"));
var MessageHandler = /** @class */ (function () {
    function MessageHandler(instance, messagePath) {
        var _this = this;
        this._guildLanguages = new Map(); // <Guild ID, Language>
        this._languages = [];
        this._messages = {};
        this._instance = instance;
        (function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b, _i, _c, messageId, _d, _e, language;
            var _this = this;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _a = this;
                        if (!messagePath) return [3 /*break*/, 2];
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require(messagePath)); })];
                    case 1:
                        _b = _f.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _b = messages_json_1.default;
                        _f.label = 3;
                    case 3:
                        _a._messages = _b;
                        for (_i = 0, _c = Object.keys(this._messages); _i < _c.length; _i++) {
                            messageId = _c[_i];
                            for (_d = 0, _e = Object.keys(this._messages[messageId]); _d < _e.length; _d++) {
                                language = _e[_d];
                                this._languages.push(language.toLowerCase());
                            }
                        }
                        if (!this._languages.includes(instance.defaultLanguage)) {
                            throw new Error("The current default language defined is not supported.");
                        }
                        instance.on(Events_1.default.DATABASE_CONNECTED, function (connection, state) { return __awaiter(_this, void 0, void 0, function () {
                            var results, _i, results_1, _a, guildId, language;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (state !== 'Connected') {
                                            return [2 /*return*/];
                                        }
                                        return [4 /*yield*/, languages_1.default.find()
                                            // @ts-ignore
                                        ];
                                    case 1:
                                        results = _b.sent();
                                        // @ts-ignore
                                        for (_i = 0, results_1 = results; _i < results_1.length; _i++) {
                                            _a = results_1[_i], guildId = _a._id, language = _a.language;
                                            this._guildLanguages.set(guildId, language);
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [2 /*return*/];
                }
            });
        }); })();
    }
    MessageHandler.prototype.languages = function () {
        return this._languages;
    };
    MessageHandler.prototype.setLanguage = function (guild, language) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (guild) {
                    this._guildLanguages.set(guild.id, language);
                }
                return [2 /*return*/];
            });
        });
    };
    MessageHandler.prototype.getLanguage = function (guild) {
        if (guild) {
            var result = this._guildLanguages.get(guild.id);
            if (result) {
                return result;
            }
        }
        return this._instance.defaultLanguage;
    };
    MessageHandler.prototype.get = function (guild, messageId, args) {
        if (args === void 0) { args = {}; }
        var language = this.getLanguage(guild);
        var translations = this._messages[messageId];
        if (!translations) {
            console.error("WOKCommands > Could not find the correct message to send for \"" + messageId + "\"");
            return 'Could not find the correct message to send. Please report this to the bot developer.';
        }
        var result = translations[language];
        for (var _i = 0, _a = Object.keys(args); _i < _a.length; _i++) {
            var key = _a[_i];
            var expression = new RegExp("{" + key + "}", 'g');
            result = result.replace(expression, args[key]);
        }
        return result;
    };
    MessageHandler.prototype.getEmbed = function (guild, embedId, itemId, args) {
        if (args === void 0) { args = {}; }
        var language = this.getLanguage(guild);
        var items = this._messages[embedId];
        if (!items) {
            console.error("WOKCommands > Could not find the correct item to send for \"" + embedId + "\" -> \"" + itemId + "\"");
            return 'Could not find the correct message to send. Please report this to the bot developer.';
        }
        var translations = items[itemId];
        if (!translations) {
            console.error("WOKCommands > Could not find the correct message to send for \"" + embedId + "\"");
            return 'Could not find the correct message to send. Please report this to the bot developer.';
        }
        var result = translations[language];
        for (var _i = 0, _a = Object.keys(args); _i < _a.length; _i++) {
            var key = _a[_i];
            var expression = new RegExp("{" + key + "}", 'g');
            result = result.replace(expression, args[key]);
        }
        return result;
    };
    return MessageHandler;
}());
exports.default = MessageHandler;
