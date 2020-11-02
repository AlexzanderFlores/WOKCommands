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
var path_1 = __importDefault(require("path"));
var CommandHandler_1 = __importDefault(require("./CommandHandler"));
var FeatureHandler_1 = __importDefault(require("./FeatureHandler"));
var mongo_1 = __importDefault(require("./mongo"));
var prefixes_1 = __importDefault(require("./models/prefixes"));
var get_all_files_1 = __importDefault(require("./get-all-files"));
var WOKCommands = /** @class */ (function () {
    function WOKCommands(client, commandsDir, featureDir) {
        var _this = this;
        this._defaultPrefix = '!';
        this._commandsDir = 'commands';
        this._featureDir = '';
        this._mongo = '';
        this._syntaxError = 'Incorrect usage!';
        this._prefixes = {};
        this._featureHandler = null;
        if (!client) {
            throw new Error('No Discord JS Client provided as first argument!');
        }
        if (!commandsDir) {
            console.warn('WOKCommands > No commands folder specified. Using "commands"');
        }
        // Get the directory path of the project using this package
        // This way users don't need to use path.join(__dirname, 'dir')
        if (module && module.parent) {
            // @ts-ignore
            var path_2 = module.parent.path;
            if (path_2) {
                commandsDir = path_2 + "/" + (commandsDir || this._commandsDir);
                if (featureDir) {
                    featureDir = path_2 + "/" + featureDir;
                }
            }
        }
        this._commandsDir = commandsDir || this._commandsDir;
        this._featureDir = featureDir || this._featureDir;
        this._commandHandler = new CommandHandler_1.default(this, client, this._commandsDir);
        if (this._featureDir) {
            this._featureHandler = new FeatureHandler_1.default(client, this._featureDir);
        }
        setTimeout(function () {
            if (_this._mongo) {
                mongo_1.default(_this._mongo);
            }
            else {
                console.warn('WOKCommands > No MongoDB connection URI provided. Some features might not work! See this for more details:\nhttps://github.com/AlexzanderFlores/WOKCommands#setup');
            }
        }, 500);
        // Register built in commands
        for (var _i = 0, _a = get_all_files_1.default(path_1.default.join(__dirname, 'commands')); _i < _a.length; _i++) {
            var _b = _a[_i], file = _b[0], fileName = _b[1];
            this._commandHandler.registerCommand(this, client, file, fileName);
        }
        // Load prefixes from Mongo
        var loadPrefixes = function () { return __awaiter(_this, void 0, void 0, function () {
            var results, _i, results_1, result, _id, prefix;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prefixes_1.default.find({})];
                    case 1:
                        results = _a.sent();
                        for (_i = 0, results_1 = results; _i < results_1.length; _i++) {
                            result = results_1[_i];
                            _id = result._id, prefix = result.prefix;
                            this._prefixes[_id] = prefix;
                        }
                        console.log(this._prefixes);
                        return [2 /*return*/];
                }
            });
        }); };
        loadPrefixes();
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
    Object.defineProperty(WOKCommands.prototype, "syntaxError", {
        get: function () {
            return this._syntaxError;
        },
        enumerable: false,
        configurable: true
    });
    WOKCommands.prototype.setSyntaxError = function (syntaxError) {
        this._syntaxError = syntaxError;
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
        return this._prefixes[guild ? guild.id : ''] || this._defaultPrefix;
    };
    WOKCommands.prototype.setPrefix = function (guild, prefix) {
        if (guild) {
            this._prefixes[guild.id] = prefix;
        }
    };
    Object.defineProperty(WOKCommands.prototype, "commandHandler", {
        get: function () {
            return this._commandHandler;
        },
        enumerable: false,
        configurable: true
    });
    return WOKCommands;
}());
module.exports = WOKCommands;
