"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const CommandErrors_1 = __importDefault(require("../enums/CommandErrors"));
module.exports = (guild, command, instance, member, user, reply) => {
    if (!guild || !member) {
        return true;
    }
    const { requiredPermissions, error } = command;
    for (const perm of requiredPermissions || []) {
        // @ts-ignore
        if (!member.permissions.has(perm)) {
            if (error) {
                error({
                    error: CommandErrors_1.default.MISSING_PERMISSIONS,
                    command,
                });
            }
            else {
                reply(instance.messageHandler.get(guild, 'MISSING_PERMISSION', {
                    PERM: perm,
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
    }
    return true;
};
