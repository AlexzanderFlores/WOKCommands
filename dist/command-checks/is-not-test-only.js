"use strict";
module.exports = async (commandCheck) => {
    const { guild, command, instance } = commandCheck;
    if (!command.testOnly) {
        return true;
    }
    return guild && instance.testServers.includes(guild.id);
};
