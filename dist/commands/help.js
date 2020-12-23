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
Object.defineProperty(exports, "__esModule", { value: true });
var discord_js_1 = require("discord.js");
var pageLimit = 3;
var getFirstEmbed = function (message, instance) {
    var guild = message.guild, member = message.member;
    var commands = instance.commandHandler.commands, messageHandler = instance.messageHandler;
    var embed = new discord_js_1.MessageEmbed()
        .setTitle(instance.displayName + " " + messageHandler.getEmbed(guild, 'HELP_MENU', 'TITLE'))
        .setDescription(messageHandler.getEmbed(guild, 'HELP_MENU', 'SELECT_A_CATEGORY'));
    if (instance.color) {
        embed.setColor(instance.color);
    }
    var categories = {};
    var isAdmin = member && member.hasPermission('ADMINISTRATOR');
    // TODO: See if I can use the commandHandler.getCommandsByCategory method instead
    // possibly duplicate code
    for (var _i = 0, commands_1 = commands; _i < commands_1.length; _i++) {
        var _a = commands_1[_i], category = _a.category, testOnly = _a.testOnly;
        if (!category ||
            (testOnly && guild && !instance.testServers.includes(guild.id)) ||
            (!isAdmin && instance.hiddenCategories.includes(category))) {
            continue;
        }
        if (categories[category]) {
            ++categories[category].amount;
        }
        else {
            categories[category] = {
                amount: 1,
                emoji: instance.getEmoji(category),
            };
        }
    }
    var reactions = [];
    var keys = Object.keys(categories);
    for (var a = 0; a < keys.length; ++a) {
        var key = keys[a];
        var emoji = categories[key].emoji;
        if (!emoji) {
            console.warn("WOKCommands > Category \"" + key + "\" does not have an emoji icon.");
            continue;
        }
        var visibleCommands = instance.commandHandler.getCommandsByCategory(key, true);
        var amount = visibleCommands.length;
        if (amount === 0) {
            continue;
        }
        var reaction = emoji;
        reactions.push(reaction);
        embed.setDescription(embed.description +
            ("\n\n**" + reaction + " - " + key + "** - " + amount + " command" + (amount === 1 ? '' : 's')));
    }
    return {
        embed: embed,
        reactions: reactions,
    };
};
var addReactions = function (message, reactions) {
    var emoji = reactions.shift();
    if (emoji) {
        message.react(emoji);
        addReactions(message, reactions);
    }
};
module.exports = {
    aliases: 'commands',
    maxArgs: 1,
    expectedArgs: '[command]',
    description: "Displays this bot's commands",
    category: 'Help',
    init: function (client, instance) {
        client.on('messageReactionAdd', function (reaction, user) { return __awaiter(void 0, void 0, void 0, function () {
            var message, embeds, guild, embed, displayName, emoji, _a, newEmbed, reactions, category, commandsString, split, cmdStr, commands, hasMultiplePages, desc, page, maxPages, start, a, counter, command, description, hidden, category_1, names, syntax, mainName;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        message = reaction.message;
                        if (!message.partial) return [3 /*break*/, 2];
                        return [4 /*yield*/, message.fetch()];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        if (!user.bot) {
                            embeds = message.embeds, guild = message.guild;
                            if (embeds && embeds.length === 1) {
                                embed = embeds[0];
                                displayName = instance.displayName
                                    ? instance.displayName + ' '
                                    : '';
                                if (embed.title ===
                                    "" + displayName + instance.messageHandler.getEmbed(guild, 'HELP_MENU', 'TITLE')) {
                                    emoji = reaction.emoji.name;
                                    if (emoji === '🚪') {
                                        _a = getFirstEmbed(message, instance), newEmbed = _a.embed, reactions = _a.reactions;
                                        embed.setDescription(newEmbed.description);
                                        embed.setFooter('');
                                        message.edit(embed);
                                        message.reactions.removeAll();
                                        addReactions(message, reactions);
                                        return [2 /*return*/];
                                    }
                                    category = instance.getCategory(emoji);
                                    commandsString = instance.messageHandler.getEmbed(guild, 'HELP_MENU', 'COMMANDS');
                                    if (embed.description) {
                                        split = embed.description.split('\n');
                                        cmdStr = ' ' + commandsString;
                                        if (split[0].endsWith(cmdStr)) {
                                            category = split[0].replace(cmdStr, '');
                                        }
                                    }
                                    commands = instance.commandHandler.getCommandsByCategory(category);
                                    hasMultiplePages = commands.length > pageLimit;
                                    desc = category + " " + commandsString + "\n\n" + instance.messageHandler.getEmbed(guild, 'HELP_MENU', 'DESCRIPTION_FIRST_LINE');
                                    if (hasMultiplePages) {
                                        desc += "\n\n" + instance.messageHandler.getEmbed(guild, 'HELP_MENU', 'DESCRIPTION_SECOND_LINE');
                                    }
                                    page = 1;
                                    if (embed && embed.footer && embed.footer.text) {
                                        page = parseInt(embed.footer.text.split(' ')[1]);
                                    }
                                    maxPages = Math.ceil(commands.length / pageLimit);
                                    if (emoji === '⬅') {
                                        if (page <= 1) {
                                            reaction.users.remove(user.id);
                                            return [2 /*return*/];
                                        }
                                        --page;
                                    }
                                    else if (emoji === '➡') {
                                        if (page >= maxPages) {
                                            reaction.users.remove(user.id);
                                            return [2 /*return*/];
                                        }
                                        ++page;
                                    }
                                    start = (page - 1) * pageLimit;
                                    for (a = start, counter = a; a < commands.length && a < start + pageLimit; ++a) {
                                        command = commands[a];
                                        description = command.description, hidden = command.hidden, category_1 = command.category, names = command.names, syntax = command.syntax;
                                        if (!hidden && category_1 === category_1) {
                                            if (typeof names === 'string') {
                                                // @ts-ignore
                                                names = __spreadArrays(names);
                                            }
                                            mainName = names.shift();
                                            desc += "\n\n#" + ++counter + ") **" + mainName + "**" + (description ? ' - ' : '') + description;
                                            if (names.length) {
                                                desc += "\n" + instance.messageHandler.getEmbed(guild, 'HELP_MENU', 'ALIASES') + ": \"" + names.join('", "') + "\"";
                                            }
                                            desc += "\n" + instance.messageHandler.getEmbed(guild, 'HELP_MENU', 'SYNTAX') + ": \"" + instance.getPrefix(guild) + mainName + (syntax ? ' ' : '') + syntax + "\"";
                                        }
                                    }
                                    embed.setDescription(desc);
                                    embed.setFooter("Page " + page + " / " + maxPages + ".");
                                    message.edit(embed);
                                    message.reactions.removeAll();
                                    if (hasMultiplePages) {
                                        message.react('⬅');
                                        message.react('➡');
                                    }
                                    message.react('🚪');
                                }
                            }
                        }
                        return [2 /*return*/];
                }
            });
        }); });
    },
    callback: function (options) {
        var _a, _b;
        var message = options.message, instance = options.instance;
        var guild = message.guild;
        if (guild && !((_a = guild.me) === null || _a === void 0 ? void 0 : _a.hasPermission('SEND_MESSAGES'))) {
            console.warn("WOKCommands > Could not send message due to no permissions in channel for " + guild.name);
            return;
        }
        if (guild && !((_b = guild.me) === null || _b === void 0 ? void 0 : _b.hasPermission('ADD_REACTIONS'))) {
            message.reply(instance.messageHandler.get(guild, 'NO_REACT_PERMS'));
            return;
        }
        var _c = getFirstEmbed(message, instance), embed = _c.embed, reactions = _c.reactions;
        message.channel
            .send('', {
            embed: embed,
        })
            .then(function (message) {
            addReactions(message, reactions);
        });
    },
};
