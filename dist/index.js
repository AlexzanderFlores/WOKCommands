"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var events_1 = require("events");
var CommandHandler_1 = __importDefault(require("./CommandHandler"));
var FeatureHandler_1 = __importDefault(require("./FeatureHandler"));
var mongo_1 = __importStar(require("./mongo"));
var prefixes_1 = __importDefault(require("./models/prefixes"));
var message_handler_1 = __importDefault(require("./message-handler"));
var Events_1 = __importDefault(require("./enums/Events"));
var SlashCommands_1 = __importDefault(require("./SlashCommands"));
var WOKCommands = /** @class */ (function (_super) {
    __extends(WOKCommands, _super);
    function WOKCommands(client, options) {
        var _this = _super.call(this) || this;
        _this._defaultPrefix = "!";
        _this._commandsDir = "commands";
        _this._featuresDir = "";
        _this._mongo = "";
        _this._mongoConnection = null;
        _this._displayName = "";
        _this._prefixes = {};
        _this._categories = new Map(); // <Category Name, Emoji Icon>
        _this._hiddenCategories = [];
        _this._color = "";
        _this._featureHandler = null;
        _this._tagPeople = true;
        _this._showWarns = true;
        _this._del = -1;
        _this._ignoreBots = true;
        _this._botOwner = [];
        _this._testServers = [];
        _this._defaultLanguage = "english";
        if (!client) {
            throw new Error("No Discord JS Client provided as first argument!");
        }
        _this._client = client;
        var _a = options.commandsDir, commandsDir = _a === void 0 ? "" : _a, _b = options.commandDir, commandDir = _b === void 0 ? "" : _b, _c = options.featuresDir, featuresDir = _c === void 0 ? "" : _c, _d = options.featureDir, featureDir = _d === void 0 ? "" : _d, messagesPath = options.messagesPath, _e = options.showWarns, showWarns = _e === void 0 ? true : _e, _f = options.del, del = _f === void 0 ? -1 : _f, _g = options.defaultLanguage, defaultLanguage = _g === void 0 ? "english" : _g, _h = options.ignoreBots, ignoreBots = _h === void 0 ? true : _h, dbOptions = options.dbOptions, testServers = options.testServers, _j = options.disabledDefaultCommands, disabledDefaultCommands = _j === void 0 ? [] : _j;
        var partials = client.options.partials;
        _this._commandsDir = commandsDir || commandDir || _this._commandsDir;
        _this._featuresDir = featuresDir || featureDir || _this._featuresDir;
        if (!partials ||
            !partials.includes("MESSAGE") ||
            !partials.includes("REACTION")) {
            if (showWarns) {
                console.warn("WOKCommands > It is encouraged to use both \"MESSAGE\" and \"REACTION\" partials when using WOKCommands due to it's help menu. More information can be found here: https://discord.js.org/#/docs/main/stable/topics/partials");
            }
        }
        if (showWarns && !commandsDir) {
            console.warn('WOKCommands > No commands folder specified. Using "commands"');
        }
        // Get the directory path of the project using this package
        // This way users don't need to use path.join(__dirname, 'dir')
        if (module && require.main) {
            var path = require.main.path;
            if (path) {
                _this._commandsDir = path + "/" + _this._commandsDir;
                if (_this._featuresDir) {
                    _this._featuresDir = path + "/" + _this._featuresDir;
                }
                if (messagesPath) {
                    messagesPath = path + "/" + messagesPath;
                }
            }
        }
        if (testServers) {
            if (typeof testServers === "string") {
                testServers = [testServers];
            }
            _this._testServers = testServers;
        }
        _this._showWarns = showWarns;
        _this._del = del;
        _this._defaultLanguage = defaultLanguage.toLowerCase();
        _this._ignoreBots = ignoreBots;
        if (typeof disabledDefaultCommands === "string") {
            disabledDefaultCommands = [disabledDefaultCommands];
        }
        _this._slashCommand = new SlashCommands_1.default(_this);
        _this._commandHandler = new CommandHandler_1.default(_this, client, _this._commandsDir, disabledDefaultCommands);
        _this._featureHandler = new FeatureHandler_1.default(client, _this, _this._featuresDir);
        _this._messageHandler = new message_handler_1.default(_this, messagesPath || "");
        _this.setCategorySettings("Configuration", "⚙️");
        _this.setCategorySettings("Help", "❓");
        setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
            var results, _i, results_1, result, _id, prefix;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._mongo) return [3 /*break*/, 3];
                        return [4 /*yield*/, mongo_1.default(this._mongo, this, dbOptions)];
                    case 1:
                        _a.sent();
                        this._mongoConnection = mongo_1.getMongoConnection();
                        return [4 /*yield*/, prefixes_1.default.find({})];
                    case 2:
                        results = _a.sent();
                        for (_i = 0, results_1 = results; _i < results_1.length; _i++) {
                            result = results_1[_i];
                            _id = result._id, prefix = result.prefix;
                            this._prefixes[_id] = prefix;
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        if (showWarns) {
                            console.warn("WOKCommands > No MongoDB connection URI provided. Some features might not work! See this for more details:\nhttps://github.com/AlexzanderFlores/WOKCommands#setup");
                        }
                        this.emit(Events_1.default.DATABASE_CONNECTED, null, "");
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        }); }, 500);
        return _this;
    }
    Object.defineProperty(WOKCommands.prototype, "mongoPath", {
        get: function () {
            return this._mongo;
        },
        enumerable: false,
        configurable: true
    });
    WOKCommands.prototype.setMongoPath = function (mongoPath) {
        this._mongo = mongoPath;
        return this;
    };
    /**
     * @deprecated Please use the messages.json file instead of this method.
     */
    WOKCommands.prototype.setSyntaxError = function (syntaxError) {
        console.warn("WOKCommands > The setSyntaxError method is deprecated. Please use messages.json instead. See https://www.npmjs.com/package/wokcommands#language-support for more information");
        return this;
    };
    Object.defineProperty(WOKCommands.prototype, "client", {
        get: function () {
            return this._client;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WOKCommands.prototype, "displayName", {
        get: function () {
            return this._displayName;
        },
        enumerable: false,
        configurable: true
    });
    WOKCommands.prototype.setDisplayName = function (displayName) {
        this._displayName = displayName;
        return this;
    };
    Object.defineProperty(WOKCommands.prototype, "prefixes", {
        get: function () {
            return this._prefixes;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WOKCommands.prototype, "defaultPrefix", {
        get: function () {
            return this._defaultPrefix;
        },
        enumerable: false,
        configurable: true
    });
    WOKCommands.prototype.setDefaultPrefix = function (defaultPrefix) {
        this._defaultPrefix = defaultPrefix;
        return this;
    };
    WOKCommands.prototype.getPrefix = function (guild) {
        return this._prefixes[guild ? guild.id : ""] || this._defaultPrefix;
    };
    WOKCommands.prototype.setPrefix = function (guild, prefix) {
        if (guild) {
            this._prefixes[guild.id] = prefix;
        }
        return this;
    };
    Object.defineProperty(WOKCommands.prototype, "categories", {
        get: function () {
            return this._categories;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WOKCommands.prototype, "hiddenCategories", {
        get: function () {
            return this._hiddenCategories;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WOKCommands.prototype, "color", {
        get: function () {
            return this._color;
        },
        enumerable: false,
        configurable: true
    });
    WOKCommands.prototype.setColor = function (color) {
        this._color = color;
        return this;
    };
    WOKCommands.prototype.getEmoji = function (category) {
        var emoji = this._categories.get(category) || "";
        if (typeof emoji === "object") {
            // @ts-ignore
            return "<:" + emoji.name + ":" + emoji.id + ">";
        }
        return emoji;
    };
    WOKCommands.prototype.getCategory = function (emoji) {
        var result = "";
        this._categories.forEach(function (value, key) {
            // == is intended here
            if (emoji == value) {
                // @ts-ignore
                result = key;
                return false;
            }
        });
        return result;
    };
    /**
     * @deprecated Please use the setCategorySettings instead of this method.
     */
    WOKCommands.prototype.setCategoryEmoji = function (category, emoji) {
        console.warn("WOKCommands > The setCategoryEmoji method is deprecated, please use setCategorySettings");
        this.setCategorySettings(category, emoji);
        return this;
    };
    WOKCommands.prototype.setCategorySettings = function (category, emoji) {
        if (typeof category == "string") {
            if (!emoji) {
                throw new Error("WOKCommands > An emoji is required for category \"" + category + "\"");
            }
            if (this.isEmojiUsed(emoji)) {
                console.warn("WOKCommands > The emoji \"" + emoji + "\" for category \"" + category + "\" is already used.");
            }
            this._categories.set(category, emoji || this.categories.get(category) || "");
        }
        else {
            for (var _i = 0, category_1 = category; _i < category_1.length; _i++) {
                var _a = category_1[_i], emoji_1 = _a.emoji, name_1 = _a.name, hidden = _a.hidden, customEmoji = _a.customEmoji;
                if (emoji_1.startsWith("<:") && emoji_1.endsWith(">")) {
                    customEmoji = true;
                    emoji_1 = emoji_1.split(":")[2];
                    emoji_1 = emoji_1.substring(0, emoji_1.length - 1);
                }
                if (customEmoji) {
                    emoji_1 = this._client.emojis.cache.get(emoji_1);
                }
                if (this.isEmojiUsed(emoji_1)) {
                    console.warn("WOKCommands > The emoji \"" + emoji_1 + "\" for category \"" + name_1 + "\" is already used.");
                }
                this._categories.set(name_1, emoji_1 || this.categories.get(name_1) || "");
                if (hidden) {
                    this._hiddenCategories.push(name_1);
                }
            }
        }
        return this;
    };
    WOKCommands.prototype.isEmojiUsed = function (emoji) {
        var isUsed = false;
        this._categories.forEach(function (value) {
            if (value === emoji) {
                isUsed = true;
            }
        });
        return isUsed;
    };
    Object.defineProperty(WOKCommands.prototype, "commandHandler", {
        get: function () {
            return this._commandHandler;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WOKCommands.prototype, "mongoConnection", {
        get: function () {
            return this._mongoConnection;
        },
        enumerable: false,
        configurable: true
    });
    WOKCommands.prototype.isDBConnected = function () {
        var connection = this.mongoConnection;
        return !!(connection && connection.readyState === 1);
    };
    WOKCommands.prototype.setTagPeople = function (tagPeople) {
        this._tagPeople = tagPeople;
        return this;
    };
    Object.defineProperty(WOKCommands.prototype, "tagPeople", {
        get: function () {
            return this._tagPeople;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WOKCommands.prototype, "showWarns", {
        get: function () {
            return this._showWarns;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WOKCommands.prototype, "del", {
        get: function () {
            return this._del;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WOKCommands.prototype, "ignoreBots", {
        get: function () {
            return this._ignoreBots;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WOKCommands.prototype, "botOwner", {
        get: function () {
            return this._botOwner;
        },
        enumerable: false,
        configurable: true
    });
    WOKCommands.prototype.setBotOwner = function (botOwner) {
        if (typeof botOwner === "string") {
            botOwner = [botOwner];
        }
        this._botOwner = botOwner;
        return this;
    };
    Object.defineProperty(WOKCommands.prototype, "testServers", {
        get: function () {
            return this._testServers;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WOKCommands.prototype, "defaultLanguage", {
        get: function () {
            return this._defaultLanguage;
        },
        enumerable: false,
        configurable: true
    });
    WOKCommands.prototype.setDefaultLanguage = function (defaultLanguage) {
        this._defaultLanguage = defaultLanguage;
        return this;
    };
    Object.defineProperty(WOKCommands.prototype, "messageHandler", {
        get: function () {
            return this._messageHandler;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WOKCommands.prototype, "slashCommands", {
        get: function () {
            return this._slashCommand;
        },
        enumerable: false,
        configurable: true
    });
    return WOKCommands;
}(events_1.EventEmitter));
module.exports = WOKCommands;
