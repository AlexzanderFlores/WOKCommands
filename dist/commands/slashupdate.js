"use strict";
module.exports = {
    description: 'Updates the specified slash command',
    category: 'Configuration',
    permissions: ['ADMINISTRATOR'],
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: '<command-name>',
    ownerOnly: true,
    hidden: true,
    slash: 'both',
    testOnly: true,
    callback: async ({ instance, text }) => { },
};
