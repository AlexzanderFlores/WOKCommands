"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const CommandErrors_1 = __importDefault(require("../enums/CommandErrors"));
module.exports = (guild, command, instance, member, user, reply, args, name) => {
    const { minArgs, maxArgs, expectedArgs, error } = command;
    const prefix = instance.getPrefix(guild).toLowerCase();
    if ((minArgs !== undefined && args.length < minArgs) ||
        (maxArgs !== undefined && maxArgs !== -1 && args.length > maxArgs)) {
        const syntaxError = command.syntaxError || {};
        const { messageHandler } = instance;
        let errorMsg = syntaxError[messageHandler.getLanguage(guild)] ||
            instance.messageHandler.get(guild, 'SYNTAX_ERROR');
        // Replace {PREFIX} with the actual prefix
        if (errorMsg) {
            errorMsg = errorMsg.replace(/{PREFIX}/g, prefix);
            // Replace {COMMAND} with the name of the command that was ran
            errorMsg = errorMsg.replace(/{COMMAND}/g, name);
            // Replace {ARGUMENTS} with the expectedArgs property from the command
            // If one was not provided then replace {ARGUMENTS} with an empty string
            errorMsg = errorMsg.replace(/ {ARGUMENTS}/g, expectedArgs ? ` ${expectedArgs}` : '');
        }
        if (error) {
            error({
                error: CommandErrors_1.default.INVALID_ARGUMENTS,
                command,
                message: null,
                info: {
                    minArgs,
                    maxArgs,
                    length: args.length,
                    errorMsg,
                },
            });
        }
        else {
            // Reply with the local or global syntax error
            reply(errorMsg).then((message) => {
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
    return true;
};
