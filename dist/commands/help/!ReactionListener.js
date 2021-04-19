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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addReactions = void 0;
var _get_first_embed_1 = __importDefault(require("./!get-first-embed"));
var /**
   * Recursively adds reactions to the message
   * @param message The message to react to
   * @param reactions A list of reactions to add
   */ addReactions = function (message, reactions) {
    var emoji = reactions.shift();
    if (emoji) {
        message.react(emoji);
        addReactions(message, reactions);
    }
};
exports.addReactions = addReactions;
var ReactionHandler = /** @class */ (function () {
    function ReactionHandler(instance, reaction, user) {
        var _this = this;
        this.guild = null;
        this.emojiName = "";
        this.emojiId = "";
        this.door = "🚪";
        this.pageLimit = 3;
        this.init = function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, embeds, guild;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.message.partial) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.message.fetch()];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        _a = this.message, embeds = _a.embeds, guild = _a.guild;
                        if (this.user.bot || !embeds || embeds.length !== 1) {
                            return [2 /*return*/];
                        }
                        this.embed = embeds[0];
                        this.guild = guild;
                        if (!this.canUserInteract()) {
                            return [2 /*return*/];
                        }
                        this.emojiName = this.reaction.emoji.name;
                        this.emojiId = this.reaction.emoji.id || "";
                        this.handleEmoji();
                        return [2 /*return*/];
                }
            });
        }); };
        /**
         * @returns If the bot has access to remove reactions from the help menu
         */
        this.canBotRemoveReaction = function () {
            var _a;
            return (_this.message.channel.type !== "dm" && ((_a = _this.message.member) === null || _a === void 0 ? void 0 : _a.hasPermission("MANAGE_MESSAGES")));
        };
        /**
         * @returns If the user is allowed to interact with this help menu
         */
        this.canUserInteract = function () {
            // Check if the title of the embed is correct
            var displayName = _this.instance.displayName
                ? _this.instance.displayName + " "
                : "";
            var isSameTitle = _this.embed.title ===
                "" + displayName + _this.instance.messageHandler.getEmbed(_this.guild, "HELP_MENU", "TITLE");
            if (!isSameTitle) {
                return false;
            }
            // Check if the user's ID is in the footer
            if (_this.embed.footer) {
                var text = _this.embed.footer.text;
                var id = text === null || text === void 0 ? void 0 : text.split("#")[1];
                if (id !== _this.user.id) {
                    if (_this.canBotRemoveReaction()) {
                        _this.reaction.users.remove(_this.user.id);
                    }
                    return false;
                }
            }
            return true;
        };
        /**
         * Invoked when the user returns to the main menu
         */
        this.returnToMainMenu = function () {
            var _a = _get_first_embed_1.default(_this.message, _this.instance), newEmbed = _a.embed, reactions = _a.reactions;
            _this.embed.setDescription(newEmbed.description);
            _this.message.edit(_this.embed);
            if (_this.canBotRemoveReaction()) {
                _this.message.reactions.removeAll();
            }
            addReactions(_this.message, reactions);
        };
        /**
         * @param commandLength How many commands are in the category
         * @returns An array of [page, maxPages]
         */
        this.getMaxPages = function (commandLength) {
            var page = 1;
            if (_this.embed && _this.embed.description) {
                var split = _this.embed.description.split("\n");
                var lastLine = split[split.length - 1];
                if (lastLine.startsWith("Page ")) {
                    page = parseInt(lastLine.split(" ")[1]);
                }
            }
            return [page, Math.ceil(commandLength / _this.pageLimit)];
        };
        /**
         * @returns An object containing information regarding the commands
         */
        this.getCommands = function () {
            var category = _this.instance.getCategory(_this.emojiId || _this.emojiName);
            var commandsString = _this.instance.messageHandler.getEmbed(_this.guild, "HELP_MENU", "COMMANDS");
            if (_this.embed.description) {
                var split = _this.embed.description.split("\n");
                var cmdStr = " " + commandsString;
                if (split[0].endsWith(cmdStr)) {
                    category = split[0].replace(cmdStr, "");
                }
            }
            var commands = _this.instance.commandHandler.getCommandsByCategory(category);
            return {
                length: commands.length,
                commands: commands,
                commandsString: commandsString,
                category: category,
            };
        };
        /**
         * Generates the actual menu
         */
        this.generateMenu = function (page, maxPages) {
            var _a = _this.getCommands(), length = _a.length, commands = _a.commands, commandsString = _a.commandsString, category = _a.category;
            var hasMultiplePages = length > _this.pageLimit;
            var desc = category + " " + commandsString + "\n\n" + _this.instance.messageHandler.getEmbed(_this.guild, "HELP_MENU", "DESCRIPTION_FIRST_LINE");
            if (hasMultiplePages) {
                desc += "\n\n" + _this.instance.messageHandler.getEmbed(_this.guild, "HELP_MENU", "DESCRIPTION_SECOND_LINE");
            }
            var start = (page - 1) * _this.pageLimit;
            for (var a = start, counter = a; a < commands.length && a < start + _this.pageLimit; ++a) {
                var command = commands[a];
                var hidden = command.hidden, category_1 = command.category, names = command.names;
                if (!hidden && category_1 === category_1) {
                    if (typeof names === "string") {
                        // @ts-ignore
                        names = __spreadArrays(names);
                    }
                    desc += "\n\n#" + ++counter + ") " + ReactionHandler.getHelp(command, _this.instance, _this.guild);
                }
            }
            desc += "\n\nPage " + page + " / " + maxPages + ".";
            _this.embed.setDescription(desc);
            _this.message.edit(_this.embed);
            if (_this.canBotRemoveReaction()) {
                _this.message.reactions.removeAll();
            }
            var reactions = [];
            if (hasMultiplePages) {
                reactions.push("⬅");
                reactions.push("➡");
            }
            reactions.push("🚪");
            addReactions(_this.message, reactions);
        };
        /**
         * Handles the input from the emoji
         */
        this.handleEmoji = function () {
            if (_this.emojiName === _this.door) {
                _this.returnToMainMenu();
                return;
            }
            var length = _this.getCommands().length;
            var _a = _this.getMaxPages(length), page = _a[0], maxPages = _a[1];
            if (_this.emojiName === "⬅") {
                if (page <= 1) {
                    if (_this.canBotRemoveReaction()) {
                        _this.reaction.users.remove(_this.user.id);
                    }
                    return;
                }
                --page;
            }
            else if (_this.emojiName === "➡") {
                if (page >= maxPages) {
                    if (_this.canBotRemoveReaction()) {
                        _this.reaction.users.remove(_this.user.id);
                    }
                    return;
                }
                ++page;
            }
            _this.generateMenu(page, maxPages);
        };
        this.instance = instance;
        this.reaction = reaction;
        this.user = user;
        this.message = reaction.message;
        this.init();
    }
    ReactionHandler.getHelp = function (command, instance, guild) {
        var description = command.description, syntax = command.syntax, names = command.names;
        var mainName = typeof names === "string" ? names : names.shift();
        var desc = "**" + mainName + "**" + (description ? " - " : "") + description;
        if (names.length && typeof names !== "string") {
            desc += "\n" + instance.messageHandler.getEmbed(guild, "HELP_MENU", "ALIASES") + ": \"" + names.join('", "') + "\"";
        }
        desc += "\n" + instance.messageHandler.getEmbed(guild, "HELP_MENU", "SYNTAX") + ": \"" + instance.getPrefix(guild) + mainName + (syntax ? " " : "") + (syntax || "") + "\"";
        return desc;
    };
    return ReactionHandler;
}());
exports.default = ReactionHandler;
