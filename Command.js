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
var cooldown_1 = __importDefault(require("./models/cooldown"));
var Command = /** @class */ (function () {
    function Command(instance, client, names, callback, _a) {
        var category = _a.category, minArgs = _a.minArgs, maxArgs = _a.maxArgs, syntaxError = _a.syntaxError, expectedArgs = _a.expectedArgs, description = _a.description, requiredPermissions = _a.requiredPermissions, cooldown = _a.cooldown, globalCooldown = _a.globalCooldown, ownerOnly = _a.ownerOnly;
        this._names = [];
        this._category = '';
        this._minArgs = 0;
        this._maxArgs = -1;
        this._requiredPermissions = [];
        this._requiredRoles = new Map(); // <GuildID, RoleIDs[]>
        this._callback = function () { };
        this._disabled = [];
        this._cooldownDuration = 0;
        this._cooldownChar = '';
        this._userCooldowns = new Map(); // <GuildID-UserID, Seconds> OR <dm-UserID, Seconds>
        this._guildCooldowns = new Map(); // <GuildID, Seconds>
        this._databaseCooldown = false;
        this._ownerOnly = false;
        this.instance = instance;
        this.client = client;
        this._names = typeof names === 'string' ? [names] : names;
        this._category = category;
        this._minArgs = minArgs || 0;
        this._maxArgs = maxArgs === undefined ? -1 : maxArgs;
        this._syntaxError = syntaxError;
        this._expectedArgs = expectedArgs;
        this._description = description;
        this._requiredPermissions = requiredPermissions;
        this._cooldown = cooldown || '';
        this._globalCooldown = globalCooldown || '';
        this._ownerOnly = ownerOnly;
        this._callback = callback;
        if (this.cooldown && this.globalCooldown) {
            throw new Error("Command \"" + names[0] + "\" has both a global and per-user cooldown. Commands can only have up to one of these properties.");
        }
        if (this.cooldown) {
            this.verifyCooldown(this._cooldown, 'cooldown');
        }
        if (this.globalCooldown) {
            this.verifyCooldown(this._globalCooldown, 'global cooldown');
        }
        if (this._minArgs < 0) {
            throw new Error("Command \"" + names[0] + "\" has a minimum argument count less than 0!");
        }
        if (this._maxArgs < -1) {
            throw new Error("Command \"" + names[0] + "\" has a maximum argument count less than -1!");
        }
        if (this._maxArgs !== -1 && this._maxArgs < this._minArgs) {
            throw new Error("Command \"" + names[0] + "\" has a maximum argument count less than it's minimum argument count!");
        }
    }
    Command.prototype.execute = function (message, args) {
        if (this._ownerOnly && message.author.id !== this.instance.botOwner) {
            message.reply('Only the bot owner can run this command.');
            return;
        }
        this._callback(message, args, args.join(' '), this.client, this.instance.getPrefix(message.guild), this.instance);
    };
    Object.defineProperty(Command.prototype, "names", {
        get: function () {
            return this._names;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Command.prototype, "category", {
        get: function () {
            return this._category;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Command.prototype, "minArgs", {
        get: function () {
            return this._minArgs;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Command.prototype, "maxArgs", {
        get: function () {
            return this._maxArgs;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Command.prototype, "syntaxError", {
        get: function () {
            return this._syntaxError;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Command.prototype, "expectedArgs", {
        get: function () {
            return this._expectedArgs;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Command.prototype, "description", {
        get: function () {
            return this._description;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Command.prototype, "requiredPermissions", {
        get: function () {
            return this._requiredPermissions;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Command.prototype, "cooldownDuration", {
        get: function () {
            return this._cooldownDuration;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Command.prototype, "cooldownChar", {
        get: function () {
            return this._cooldownChar;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Command.prototype, "cooldown", {
        get: function () {
            return this._cooldown;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Command.prototype, "globalCooldown", {
        get: function () {
            return this._globalCooldown;
        },
        enumerable: false,
        configurable: true
    });
    Command.prototype.verifyCooldown = function (cooldown, type) {
        var results = cooldown.match(/[a-z]+|[^a-z]+/gi) || [];
        if (results.length !== 2) {
            throw new Error("Invalid " + type + " format! Please provide \"<Duration><Type>\", examples: \"10s\" \"5m\" etc.");
        }
        this._cooldownDuration = +results[0];
        if (isNaN(this._cooldownDuration)) {
            throw new Error("Invalid " + type + " format! Number is invalid.");
        }
        this._cooldownChar = results[1];
        if (this._cooldownChar !== 's' &&
            this._cooldownChar !== 'm' &&
            this._cooldownChar !== 'h' &&
            this._cooldownChar !== 'd') {
            throw new Error("Invalid " + type + " format! Unknown type. Please provide 's', 'm', 'h', or 'd' for seconds, minutes, hours, or days respectively.");
        }
        if (type === 'global cooldown' &&
            this._cooldownChar === 's' &&
            this._cooldownDuration < 60) {
            throw new Error("Invalid " + type + " format! The minimum duration for a global cooldown is 1m.");
        }
        var moreInfo = ' For more information please see https://github.com/AlexzanderFlores/WOKCommands#command-cooldowns';
        if (this._cooldownDuration < 1) {
            throw new Error("Invalid " + type + " format! Durations must be at least 1." + moreInfo);
        }
        if ((this._cooldownChar === 's' || this._cooldownChar === 'm') &&
            this._cooldownDuration > 60) {
            throw new Error("Invalid " + type + " format! Second or minute durations cannot exceed 60." + moreInfo);
        }
        if (this._cooldownChar === 'h' && this._cooldownDuration > 24) {
            throw new Error("Invalid " + type + " format! Hour durations cannot exceed 24." + moreInfo);
        }
        if (this._cooldownChar === 'd' && this._cooldownDuration > 365) {
            throw new Error("Invalid " + type + " format! Day durations cannot exceed 365." + moreInfo);
        }
    };
    Command.prototype.verifyDatabaseCooldowns = function (connected) {
        if (this._cooldownChar === 'd' ||
            this._cooldownChar === 'h' ||
            (this._cooldownChar === 'm' && this._cooldownDuration >= 5)) {
            this._databaseCooldown = true;
            if (!connected) {
                console.warn("WOKCommands > A database connection is STRONGLY RECOMMENDED for cooldowns of 5 minutes or more.");
            }
        }
    };
    /**
     * Decrements per-user and global cooldowns
     * Deletes expired cooldowns
     */
    Command.prototype.decrementCooldowns = function () {
        var _this = this;
        var _loop_1 = function (map) {
            if (typeof map !== 'string') {
                map.forEach(function (value, key) {
                    if (--value <= 0) {
                        map.delete(key);
                    }
                    else {
                        map.set(key, value);
                    }
                    if (_this._databaseCooldown) {
                        _this.updateDatabaseCooldowns(_this.names[0] + "-" + key, value);
                    }
                });
            }
        };
        for (var _i = 0, _a = [this._userCooldowns, this._guildCooldowns]; _i < _a.length; _i++) {
            var map = _a[_i];
            _loop_1(map);
        }
    };
    Command.prototype.updateDatabaseCooldowns = function (_id, cooldown) {
        return __awaiter(this, void 0, void 0, function () {
            var type;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(cooldown % 20 === 0)) return [3 /*break*/, 4];
                        type = this.globalCooldown ? 'global' : 'per-user';
                        if (!(cooldown <= 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, cooldown_1.default.deleteOne({ _id: _id, name: this.names[0], type: type })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, cooldown_1.default.findOneAndUpdate({
                            _id: _id,
                            name: this.names[0],
                            type: type,
                        }, {
                            _id: _id,
                            name: this.names[0],
                            type: type,
                            cooldown: cooldown,
                        }, { upsert: true })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Command.prototype.setCooldown = function (guildId, userId, customCooldown) {
        var target = this.globalCooldown || this.cooldown;
        if (target) {
            var seconds = customCooldown || this._cooldownDuration;
            var durationType = customCooldown ? 's' : this._cooldownChar;
            switch (durationType) {
                case 'm':
                    seconds *= 60;
                    break;
                case 'h':
                    seconds *= 60 * 60;
                    break;
                case 'd':
                    seconds *= 60 * 60 * 24;
                    break;
            }
            // Increment to ensure we save it to the database when it is divisible by 20
            ++seconds;
            if (this.globalCooldown) {
                this._guildCooldowns.set(guildId, seconds);
            }
            else {
                this._userCooldowns.set(guildId + "-" + userId, seconds);
            }
        }
    };
    Command.prototype.getCooldownSeconds = function (guildId, userId) {
        var seconds = this.globalCooldown
            ? this._guildCooldowns.get(guildId)
            : this._userCooldowns.get(guildId + "-" + userId);
        if (!seconds) {
            return '';
        }
        var days = Math.floor(seconds / (3600 * 24));
        var hours = Math.floor((seconds % (3600 * 24)) / 3600);
        var minutes = Math.floor((seconds % 3600) / 60);
        seconds = Math.floor(seconds % 60);
        var result = '';
        if (days) {
            result += days + "d ";
        }
        if (hours) {
            result += hours + "h ";
        }
        if (minutes) {
            result += minutes + "m ";
        }
        if (seconds) {
            result += seconds + "s ";
        }
        return result.substring(0, result.length - 1);
    };
    Command.prototype.addRequiredRole = function (guildId, roleId) {
        var _a, _b;
        var array = ((_a = this._requiredRoles) === null || _a === void 0 ? void 0 : _a.get(guildId)) || [];
        if (!array.includes(roleId)) {
            array.push(roleId);
            (_b = this._requiredRoles) === null || _b === void 0 ? void 0 : _b.set(guildId, array);
        }
    };
    Command.prototype.removeRequiredRole = function (guildId, roleId) {
        var _a, _b;
        if (roleId === 'none') {
            (_a = this._requiredRoles) === null || _a === void 0 ? void 0 : _a.delete(guildId);
            return;
        }
        var array = ((_b = this._requiredRoles) === null || _b === void 0 ? void 0 : _b.get(guildId)) || [];
        var index = array ? array.indexOf(roleId) : -1;
        if (array && index >= 0) {
            array.splice(index, 1);
        }
    };
    Command.prototype.getRequiredRoles = function (guildId) {
        var map = this._requiredRoles || new Map();
        return map.get(guildId) || [];
    };
    Object.defineProperty(Command.prototype, "callback", {
        get: function () {
            return this._callback;
        },
        enumerable: false,
        configurable: true
    });
    Command.prototype.disable = function (guildId) {
        if (!this._disabled.includes(guildId)) {
            this._disabled.push(guildId);
        }
    };
    Command.prototype.enable = function (guildId) {
        var index = this._disabled.indexOf(guildId);
        if (index >= 0) {
            this._disabled.splice(index, 1);
        }
    };
    Command.prototype.isDisabled = function (guildId) {
        return this._disabled.includes(guildId);
    };
    return Command;
}());
module.exports = Command;
