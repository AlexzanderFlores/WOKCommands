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
var fs_1 = __importDefault(require("fs"));
var get_all_files_1 = __importDefault(require("./get-all-files"));
var loadFeature = function (func, client, instance, isEnabled) {
    func(client, instance, isEnabled);
};
var FeatureHandler = /** @class */ (function () {
    function FeatureHandler(client, instance, dir) {
        var _this = this;
        this._features = new Map(); // <Feature name, Disabled GuildIDs>
        this.isEnabled = function (guildId, feature) {
            return !(_this._features.get(feature) || []).includes(guildId);
        };
        if (dir) {
            if (fs_1.default.existsSync(dir)) {
                var files_1 = get_all_files_1.default(dir);
                var amount = files_1.length;
                if (amount > 0) {
                    console.log("WOKCommands > Loaded " + amount + " listener" + (amount === 1 ? '' : 's') + ".");
                    (function () { return __awaiter(_this, void 0, void 0, function () {
                        var waitingForDB, _loop_1, _i, files_2, _a, file, fileName;
                        var _this = this;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    waitingForDB = [];
                                    _loop_1 = function (file, fileName) {
                                        var _a, func, config, displayName, dbName, missing, isEnabled;
                                        return __generator(this, function (_b) {
                                            switch (_b.label) {
                                                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require(file)); })];
                                                case 1:
                                                    _a = _b.sent(), func = _a.default, config = _a.config;
                                                    if (config) {
                                                        displayName = config.displayName, dbName = config.dbName;
                                                        missing = [];
                                                        if (!displayName)
                                                            missing.push('displayName');
                                                        if (!dbName)
                                                            missing.push('dbName');
                                                        if (missing.length) {
                                                            console.warn("WOKCommands > Feature \"" + fileName + "\" has a config file that doesn't contain the following properties: " + missing);
                                                        }
                                                    }
                                                    else {
                                                        console.warn("WOKCommands > Feature \"" + fileName + "\" does not export a config object.");
                                                    }
                                                    if (typeof func === 'function') {
                                                        isEnabled = function (guildId) {
                                                            return _this.isEnabled(guildId, file);
                                                        };
                                                        if (config && config.loadDBFirst === true) {
                                                            waitingForDB.push({
                                                                func: func,
                                                                client: client,
                                                                instance: instance,
                                                                isEnabled: isEnabled,
                                                            });
                                                            return [2 /*return*/, "continue"];
                                                        }
                                                        loadFeature(func, client, instance, isEnabled);
                                                    }
                                                    return [2 /*return*/];
                                            }
                                        });
                                    };
                                    _i = 0, files_2 = files_1;
                                    _b.label = 1;
                                case 1:
                                    if (!(_i < files_2.length)) return [3 /*break*/, 4];
                                    _a = files_2[_i], file = _a[0], fileName = _a[1];
                                    return [5 /*yield**/, _loop_1(file, fileName)];
                                case 2:
                                    _b.sent();
                                    _b.label = 3;
                                case 3:
                                    _i++;
                                    return [3 /*break*/, 1];
                                case 4:
                                    instance.on('databaseConnected', function (connection, state) {
                                        if (state === 'Connected') {
                                            for (var _i = 0, waitingForDB_1 = waitingForDB; _i < waitingForDB_1.length; _i++) {
                                                var _a = waitingForDB_1[_i], func = _a.func, client_1 = _a.client, instance_1 = _a.instance, isEnabled = _a.isEnabled;
                                                loadFeature(func, client_1, instance_1, isEnabled);
                                            }
                                        }
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    }); })();
                }
            }
            else {
                throw new Error("Listeners directory \"" + dir + "\" doesn't exist!");
            }
        }
    }
    return FeatureHandler;
}());
module.exports = FeatureHandler;
