"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const CommandErrors_1 = __importDefault(require("../enums/CommandErrors"));
module.exports = (guild, command, instance, member, user, reply) => {
    const { cooldown, globalCooldown, error } = command;
    if ((cooldown || globalCooldown) && user) {
        const guildId = guild ? guild.id : 'dm';
        const timeLeft = command.getCooldownSeconds(guildId, user.id);
        if (timeLeft) {
            if (error) {
                error({
                    error: CommandErrors_1.default.COOLDOWN,
                    command,
                    message: null,
                    info: {
                        timeLeft,
                    },
                });
            }
            else {
                reply(instance.messageHandler.get(guild, 'COOLDOWN', {
                    COOLDOWN: timeLeft,
                })).then((message) => {
                    if (!message) {
                        return;
                    }
                    if (instance.delErrMsgCooldown === -1 || !message.deletable) {
                        return;
                    }
                    setTimeout(() => {
                        message.delete();
                    }, 1000 * instance.delErrMsgCooldown);
                });
            }
            return false;
        }
        command.setCooldown(guildId, user.id);
    }
    return true;
};
