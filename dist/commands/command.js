"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const disabled_commands_1 = __importDefault(require("../models/disabled-commands"));
module.exports = {
    description: 'Enables or disables a command for this guild',
    category: 'Configuration',
    permissions: ['ADMINISTRATOR'],
    minArgs: 2,
    maxArgs: 2,
    expectedArgs: '<"enable" or "disable"> <Command Name>',
    cooldown: '2s',
    slash: 'both',
    options: [
        {
            name: 'action',
            description: 'Either "enable" or "disable"',
            required: true,
            type: 'STRING',
            choices: [
                {
                    name: 'Enable',
                    value: 'enable',
                },
                { name: 'Disable', value: 'disable' },
            ],
        },
        {
            name: 'command',
            description: 'The name of the command',
            required: true,
            type: 'STRING',
        },
    ],
    callback: async (options) => {
        const { channel, args, instance } = options;
        const { guild } = channel;
        const newState = args.shift()?.toLowerCase();
        const name = (args.shift() || '').toLowerCase();
        if (!guild) {
            return instance.messageHandler.get(guild, 'CANNOT_ENABLE_DISABLE_IN_DMS');
        }
        if (!instance.isDBConnected()) {
            return instance.messageHandler.get(guild, 'NO_DATABASE_FOUND');
        }
        if (newState !== 'enable' && newState !== 'disable') {
            return instance.messageHandler.get(guild, 'ENABLE_DISABLE_STATE');
        }
        const command = instance.commandHandler.getCommand(name);
        if (command) {
            const mainCommand = command.names[0];
            if (mainCommand === 'command') {
                return instance.messageHandler.get(guild, 'CANNOT_DISABLE_THIS_COMMAND');
            }
            const isDisabled = command.isDisabled(guild.id);
            if (newState === 'enable') {
                if (!isDisabled) {
                    return instance.messageHandler.get(guild, 'COMMAND_ALREADY_ENABLED');
                }
                await disabled_commands_1.default.deleteOne({
                    guildId: guild.id,
                    command: mainCommand,
                });
                command.enable(guild.id);
                return instance.messageHandler.get(guild, 'COMMAND_NOW_ENABLED', {
                    COMMAND: mainCommand,
                });
            }
            if (isDisabled) {
                return instance.messageHandler.get(guild, 'COMMAND_ALREADY_DISABLED');
            }
            await new disabled_commands_1.default({
                guildId: guild.id,
                command: mainCommand,
            }).save();
            command.disable(guild.id);
            return instance.messageHandler.get(guild, 'COMMAND_NOW_DISABLED', {
                COMMAND: mainCommand,
            });
        }
        return instance.messageHandler.get(guild, 'UNKNOWN_COMMAND', {
            COMMAND: name,
        });
    },
};
