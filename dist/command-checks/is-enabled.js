"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const CommandErrors_1 = __importDefault(require("../enums/CommandErrors"));
module.exports = (guild, command, instance, member, user, reply) => {
    if (!guild || !command.isDisabled(guild.id)) {
        return true;
    }
    const { error } = command;
    if (error) {
        error({
            error: CommandErrors_1.default.COMMAND_DISABLED,
            command,
        });
    }
    else {
        reply(instance.messageHandler.get(guild, 'DISABLED_COMMAND')).then((message) => {
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
};
