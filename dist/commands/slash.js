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
var discord_js_1 = require("discord.js");
module.exports = {
    maxArgs: 3,
    expectedArgs: '["delete"] [command ID]',
    ownerOnly: true,
    description: "Allows the bot developers to manage existing slash commands",
    category: "Development",
    hidden: true,
    callback: function (options) { return __awaiter(void 0, void 0, void 0, function () {
        var channel, instance, args, guild, slashCommands, global, targetCommand_1, useGuild, embed, guildOnly;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    channel = options.channel, instance = options.instance, args = options.args;
                    guild = channel.guild;
                    slashCommands = instance.slashCommands;
                    return [4 /*yield*/, slashCommands.get()];
                case 1:
                    global = _a.sent();
                    if (args.length && args[0] === "delete") {
                        targetCommand_1 = args[1];
                        if (!targetCommand_1) {
                            channel.send("Please specify a command ID");
                            return [2 /*return*/];
                        }
                        useGuild = global.filter(function (cmd) { return cmd.id === targetCommand_1; }).length === 0;
                        slashCommands.delete(targetCommand_1, useGuild ? guild.id : undefined);
                        if (useGuild) {
                            channel.send("Slash command with the ID \"" + targetCommand_1 + "\" has been deleted from guild \"" + guild.id + "\"");
                        }
                        else {
                            channel.send("Slash command with the ID \"" + targetCommand_1 + "\" has been deleted. This may take up to 1 hour to be seen on all servers using your bot..");
                        }
                        return [2 /*return*/];
                    }
                    embed = new discord_js_1.MessageEmbed()
                        .addField("How to delete a slash command:", "_" + instance.getPrefix(guild) + "slash delete <command ID>")
                        .addField("List of global slash commands:", global.length ? global.map(function (cmd) { return cmd.name + ": " + cmd.id; }) : "None");
                    if (!guild) return [3 /*break*/, 3];
                    return [4 /*yield*/, slashCommands.get(guild.id)];
                case 2:
                    guildOnly = _a.sent();
                    embed.addField("List of slash commands for \"" + guild.name + "\" only", guildOnly.length
                        ? guildOnly.map(function (cmd) { return " " + cmd.name + ": " + cmd.id; })
                        : "None");
                    _a.label = 3;
                case 3:
                    embed.setColor(instance.color);
                    channel.send("", { embed: embed });
                    return [2 /*return*/];
            }
        });
    }); },
};
