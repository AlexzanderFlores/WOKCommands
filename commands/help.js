"use strict";
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
var getFirstEmbed = function (instance) {
    var commands = instance.commandHandler.commands;
    var embed = new discord_js_1.MessageEmbed()
        .setTitle(instance.displayName + " Help Menu")
        .setDescription("Please select a command category by clicking it's reaction.");
    if (instance.color) {
        embed.setColor(instance.color);
    }
    var categories = {};
    for (var _i = 0, commands_1 = commands; _i < commands_1.length; _i++) {
        var category = commands_1[_i].category;
        if (!category) {
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
        var _a = categories[key], amount = _a.amount, emoji = _a.emoji;
        if (!emoji) {
            console.warn("WOKCommands > Category \"" + key + "\" does not have an emoji icon.");
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
        instance.updateCache(client);
        client.on('messageReactionAdd', function (reaction, user) {
            if (!user.bot) {
                var message = reaction.message;
                var embeds = message.embeds, guild = message.guild;
                if (embeds && embeds.length === 1) {
                    var embed = embeds[0];
                    var displayName = instance.displayName
                        ? instance.displayName + ' '
                        : '';
                    if (embed.title === displayName + "Help Menu") {
                        var emoji = reaction.emoji.name;
                        if (emoji === '🚪') {
                            var _a = getFirstEmbed(instance), newEmbed = _a.embed, reactions = _a.reactions;
                            embed.setDescription(newEmbed.description);
                            embed.setFooter('');
                            message.edit(embed);
                            message.reactions.removeAll();
                            addReactions(message, reactions);
                            return;
                        }
                        var category = instance.getCategory(emoji);
                        if (embed.description) {
                            var split = embed.description.split('\n');
                            var cmdStr = ' Commands';
                            if (split[0].endsWith(cmdStr)) {
                                category = split[0].replace(cmdStr, '');
                            }
                        }
                        var commands = instance.commandHandler.getCommandsByCategory(category);
                        var hasMultiplePages = commands.length > pageLimit;
                        var desc = category + " Commands\n\nUse \uD83D\uDEAA to return to the previous menu.";
                        if (hasMultiplePages) {
                            desc += '\n\nUse ⬅ and ➡ to navigate between pages.';
                        }
                        var page = 1;
                        if (embed && embed.footer && embed.footer.text) {
                            page = parseInt(embed.footer.text.split(' ')[1]);
                        }
                        var maxPages = Math.ceil(commands.length / pageLimit);
                        if (emoji === '⬅') {
                            if (page <= 1) {
                                reaction.users.remove(user.id);
                                return;
                            }
                            --page;
                        }
                        else if (emoji === '➡') {
                            if (page >= maxPages) {
                                reaction.users.remove(user.id);
                                return;
                            }
                            ++page;
                        }
                        var start = (page - 1) * pageLimit;
                        for (var a = start, counter = a; a < commands.length && a < start + pageLimit; ++a) {
                            var command = commands[a];
                            if (command.category === category) {
                                var names = __spreadArrays(command.names);
                                var mainName = names.shift();
                                desc += "\n\n#" + ++counter + ") **" + mainName + "** - " + command.description;
                                if (names.length) {
                                    desc += "\nAliases: \"" + names.join('", "') + "\"";
                                }
                                desc += "\nSyntax: \"" + instance.getPrefix(guild) + mainName + (command.syntax ? ' ' : '') + command.syntax + "\"";
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
        });
    },
    callback: function (message, args, text, client, prefix, instance) {
        var _a = getFirstEmbed(instance), embed = _a.embed, reactions = _a.reactions;
        message.channel
            .send('', {
            embed: embed,
        })
            .then(function (message) {
            addReactions(message, reactions);
        });
    },
};
