"use strict";
const Discord = require('discord.js')

module.exports = (guild, command, instance, member, user, reply) => {
    const { voiceOnly } = command;
    if (!voiceOnly) {
        return true;
    }
    if (!(member instanceof Discord.GuildMember) || !member.voice.channel) {
        reply(instance.messageHandler.get(guild, 'VOICE_CHANNEL_ONLY')).then((message) => {
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
    return true;
};
