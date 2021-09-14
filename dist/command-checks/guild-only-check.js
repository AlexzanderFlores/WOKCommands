"use strict";
module.exports = (guild, command, instance, member, user, reply) => {
    // If this command doesn't care if it's in a guild or not then just simply return true
    if (!command || !command.guildOnly) {
        return true;
    }
    if (!guild) {
        reply(instance.messageHandler.get(guild, 'GUILD_ONLY_COMMAND')).then((message) => {
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
        return false;
    }
    // The guild exists
    return true;
};
