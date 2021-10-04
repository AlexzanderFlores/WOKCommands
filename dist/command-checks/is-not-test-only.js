"use strict";
module.exports = (guild, command, instance) => {
    const { testOnly } = command;
    if (!testOnly) {
        return true;
    }
    return guild && instance.testServers.includes(guild.id);
};
