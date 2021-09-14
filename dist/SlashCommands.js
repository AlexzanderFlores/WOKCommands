"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const path_1 = __importDefault(require("path"));
const get_all_files_1 = __importDefault(require("./get-all-files"));
const slash_commands_1 = __importDefault(require("./models/slash-commands"));
class SlashCommands {
    _client;
    _instance;
    _commandChecks = new Map();
    constructor(instance, listen = true) {
        this._instance = instance;
        this._client = instance.client;
        for (const [file, fileName] of get_all_files_1.default(path_1.default.join(__dirname, 'command-checks'))) {
            this._commandChecks.set(fileName, require(file));
        }
        const replyFromCheck = async (reply, interaction) => {
            if (!reply) {
                return new Promise((resolve) => {
                    resolve('No reply provided.');
                });
            }
            if (typeof reply === 'string') {
                return interaction.reply({
                    content: reply,
                    ephemeral: instance.ephemeral,
                });
            }
            else {
                let embeds = [];
                if (Array.isArray(reply)) {
                    embeds = reply;
                }
                else {
                    embeds.push(reply);
                }
                return interaction.reply({
                    embeds,
                    ephemeral: instance.ephemeral,
                });
            }
        };
        if (listen) {
            this._client.on('interactionCreate', async (interaction) => {
                if (!interaction.isCommand()) {
                    return;
                }
                const { member, user, commandName, options, guild, channelId } = interaction;
                const channel = guild?.channels.cache.get(channelId) || null;
                const command = instance.commandHandler.getCommand(commandName);
                if (!command) {
                    interaction.reply({
                        content: instance.messageHandler.get(guild, 'INVALID_SLASH_COMMAND'),
                        ephemeral: instance.ephemeral,
                    });
                    return;
                }
                const args = [];
                options.data.forEach(({ value }) => {
                    args.push(String(value));
                });
                for (const [checkName, checkFunction,] of this._commandChecks.entries()) {
                    if (!(await checkFunction(guild, command, instance, member, user, (reply) => {
                        return replyFromCheck(reply, interaction);
                    }, args, commandName, channel))) {
                        return;
                    }
                }
                this.invokeCommand(interaction, commandName, options, args, member, guild, channel);
            });
        }
    }
    getCommands(guildId) {
        if (guildId) {
            return this._client.guilds.cache.get(guildId)?.commands;
        }
        return this._client.application?.commands;
    }
    async get(guildId) {
        const commands = this.getCommands(guildId);
        if (commands) {
            return commands.cache;
        }
        return new Map();
    }
    async create(name, description, options, guildId) {
        // @ts-ignore
        const nameAndClient = `${name}-${this._client.user.id}`;
        let commands;
        if (guildId) {
            commands = this._client.guilds.cache.get(guildId)?.commands;
        }
        else {
            commands = this._client.application?.commands;
            if (this._instance.isDBConnected()) {
                const alreadyCreated = await slash_commands_1.default.findOne({ nameAndClient });
                if (alreadyCreated) {
                    try {
                        await commands?.fetch(alreadyCreated._id);
                    }
                    catch (e) {
                        await slash_commands_1.default.deleteOne({ nameAndClient });
                    }
                    return;
                }
            }
        }
        if (commands) {
            const newCommand = await commands.create({
                name,
                description,
                options,
            });
            if (!guildId && this._instance.isDBConnected()) {
                await new slash_commands_1.default({
                    _id: newCommand.id,
                    nameAndClient,
                }).save();
            }
            return newCommand;
        }
        return Promise.resolve(undefined);
    }
    async delete(commandId, guildId) {
        const commands = this.getCommands(guildId);
        if (commands) {
            return await commands.cache.get(commandId)?.delete();
        }
        return Promise.resolve(undefined);
    }
    async invokeCommand(interaction, commandName, options, args, member, guild, channel) {
        const command = this._instance.commandHandler.getCommand(commandName);
        if (!command || !command.callback) {
            return;
        }
        const reply = await command.callback({
            member,
            guild,
            channel,
            args,
            text: args.join(' '),
            client: this._client,
            instance: this._instance,
            interaction,
            options,
        });
        if (reply) {
            if (typeof reply === 'string') {
                interaction.reply({
                    content: reply,
                });
            }
            else {
                let embeds = [];
                if (Array.isArray(reply)) {
                    embeds = reply;
                }
                else {
                    embeds.push(reply);
                }
                interaction.reply({ embeds });
            }
        }
    }
}
module.exports = SlashCommands;
