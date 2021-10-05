"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Command_1 = __importDefault(require("./Command"));
const get_all_files_1 = __importDefault(require("./get-all-files"));
const disabled_commands_1 = __importDefault(require("./models/disabled-commands"));
const required_roles_1 = __importDefault(require("./models/required-roles"));
const cooldown_1 = __importDefault(require("./models/cooldown"));
const channel_commands_1 = __importDefault(require("./models/channel-commands"));
const permissions_1 = require("./permissions");
const CommandErrors_1 = __importDefault(require("./enums/CommandErrors"));
const Events_1 = __importDefault(require("./enums/Events"));
const replyFromCheck = async (reply, message) => {
    if (!reply) {
        return new Promise((resolve) => {
            resolve('No reply provided.');
        });
    }
    if (typeof reply === 'string') {
        return message.reply({
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
        return message.reply({
            embeds,
        });
    }
};
class CommandHandler {
    _commands = new Map();
    _client = null;
    _commandChecks = new Map();
    constructor(instance, client, dir, disabledDefaultCommands, typeScript = false) {
        this._client = client;
        this.setUp(instance, client, dir, disabledDefaultCommands, typeScript);
    }
    async setUp(instance, client, dir, disabledDefaultCommands, typeScript = false) {
        // Do not pass in TS here because this should always compiled to JS
        for (const [file, fileName] of get_all_files_1.default(path_1.default.join(__dirname, 'commands'))) {
            if (disabledDefaultCommands.includes(fileName)) {
                continue;
            }
            await this.registerCommand(instance, client, file, fileName, true);
        }
        // Do not pass in TS here because this should always compiled to JS
        for (const [file, fileName] of get_all_files_1.default(path_1.default.join(__dirname, 'command-checks'))) {
            this._commandChecks.set(fileName, require(file));
        }
        if (dir) {
            if (!fs_1.default.existsSync(dir)) {
                throw new Error(`Commands directory "${dir}" doesn't exist!`);
            }
            const files = get_all_files_1.default(dir, typeScript ? '.ts' : '');
            const amount = files.length;
            console.log(`WOKCommands > Loaded ${amount} command${amount === 1 ? '' : 's'}.`);
            for (const [file, fileName] of files) {
                await this.registerCommand(instance, client, file, fileName);
            }
            if (instance.isDBConnected()) {
                await this.fetchDisabledCommands();
                await this.fetchRequiredRoles();
                await this.fetchChannelOnly();
            }
            this._commands.forEach(async (command) => {
                command.verifyDatabaseCooldowns();
                if (instance.isDBConnected()) {
                    const results = await cooldown_1.default.find({
                        name: command.names[0],
                        type: command.globalCooldown ? 'global' : 'per-user',
                    });
                    for (const { _id, cooldown } of results) {
                        const [name, guildId, userId] = _id.split('-');
                        command.setCooldown(guildId, userId, cooldown);
                    }
                }
            });
            client.on('messageCreate', async (message) => {
                const guild = message.guild;
                let content = message.content;
                const prefix = instance.getPrefix(guild).toLowerCase();
                if (!content.toLowerCase().startsWith(prefix)) {
                    return;
                }
                if (instance.ignoreBots && message.author.bot) {
                    return;
                }
                // Remove the prefix
                content = content.substring(prefix.length);
                const args = content.split(/[ ]+/g);
                // Remove the "command", leaving just the arguments
                const firstElement = args.shift();
                if (!firstElement) {
                    return;
                }
                // Ensure the user input is lower case because it is stored as lower case in the map
                const name = firstElement.toLowerCase();
                const command = this._commands.get(name);
                if (!command) {
                    return;
                }
                const { error, slash } = command;
                if (slash === true) {
                    return;
                }
                const { member, author: user, channel } = message;
                for (const [checkName, checkFunction,] of this._commandChecks.entries()) {
                    if (!(await checkFunction(guild, command, instance, member, user, (reply) => {
                        return replyFromCheck(reply, message);
                    }, args, name, channel))) {
                        return;
                    }
                }
                try {
                    command.execute(message, args);
                }
                catch (e) {
                    if (error) {
                        error({
                            error: CommandErrors_1.default.EXCEPTION,
                            command,
                            message,
                            info: {
                                error: e,
                            },
                        });
                    }
                    else {
                        message.reply(instance.messageHandler.get(guild, 'EXCEPTION'));
                        console.error(e);
                    }
                    instance.emit(Events_1.default.COMMAND_EXCEPTION, command, message, e);
                }
            });
        }
        const decrementCountdown = () => {
            this._commands.forEach((command) => {
                command.decrementCooldowns();
            });
            setTimeout(decrementCountdown, 1000);
        };
        decrementCountdown();
    }
    async registerCommand(instance, client, file, fileName, builtIn = false) {
        let configuration = await require(file);
        // person is using 'export default' so we import the default instead
        if (configuration.default && Object.keys(configuration).length === 1) {
            configuration = configuration.default;
        }
        const { name = fileName, category, commands, aliases, init, callback, run, execute, error, description, requiredPermissions, permissions, slash, expectedArgs, expectedArgsTypes, minArgs, options = [], } = configuration;
        const { testOnly } = configuration;
        if (run || execute) {
            throw new Error(`Command located at "${file}" has either a "run" or "execute" function. Please rename that function to "callback".`);
        }
        let names = commands || aliases || [];
        if (!name && (!names || names.length === 0)) {
            throw new Error(`Command located at "${file}" does not have a name, commands array, or aliases array set. Please set at lease one property to specify the command name.`);
        }
        if (typeof names === 'string') {
            names = [names];
        }
        if (typeof name !== 'string') {
            throw new Error(`Command located at "${file}" does not have a string as a name.`);
        }
        if (name && !names.includes(name.toLowerCase())) {
            names.unshift(name.toLowerCase());
        }
        if (requiredPermissions || permissions) {
            for (const perm of requiredPermissions || permissions) {
                if (!permissions_1.permissionList.includes(perm)) {
                    throw new Error(`Command located at "${file}" has an invalid permission node: "${perm}". Permissions must be all upper case and be one of the following: "${[
                        ...permissions_1.permissionList,
                    ].join('", "')}"`);
                }
            }
        }
        const missing = [];
        if (!category) {
            missing.push('Category');
        }
        if (!description) {
            missing.push('Description');
        }
        if (missing.length && instance.showWarns) {
            console.warn(`WOKCommands > Command "${names[0]}" does not have the following properties: ${missing}.`);
        }
        if (testOnly && !instance.testServers.length) {
            console.warn(`WOKCommands > Command "${names[0]}" has "testOnly" set to true, but no test servers are defined.`);
        }
        if (slash !== undefined && typeof slash !== 'boolean' && slash !== 'both') {
            throw new Error(`WOKCommands > Command "${names[0]}" has a "slash" property that is not boolean "true" or string "both".`);
        }
        if (!slash && options.length) {
            throw new Error(`WOKCommands > Command "${names[0]}" has an "options" property but is not a slash command.`);
        }
        if (slash && !(builtIn && !instance.isDBConnected())) {
            if (!description) {
                throw new Error(`WOKCommands > A description is required for command "${names[0]}" because it is a slash command.`);
            }
            if (minArgs !== undefined && !expectedArgs) {
                throw new Error(`WOKCommands > Command "${names[0]}" has "minArgs" property defined without "expectedArgs" property as a slash command.`);
            }
            if (options.length) {
                for (const key in options) {
                    const name = options[key].name;
                    let lowerCase = name.toLowerCase();
                    if (name !== lowerCase && instance.showWarns) {
                        console.log(`WOKCommands > Command "${names[0]}" has an option of "${name}". All option names must be lower case for slash commands. WOKCommands will modify this for you.`);
                    }
                    if (lowerCase.match(/\s/g)) {
                        lowerCase = lowerCase.replace(/\s/g, '_');
                        console.log(`WOKCommands > Command "${names[0]}" has an option of "${name}" with a white space in it. It is a best practice for option names to only be one word. WOKCommands will modify this for you.`);
                    }
                    options[key].name = lowerCase;
                }
            }
            else if (expectedArgs) {
                const split = expectedArgs
                    .substring(1, expectedArgs.length - 1)
                    .split(/[>\]] [<\[]/);
                for (let a = 0; a < split.length; ++a) {
                    const item = split[a];
                    options.push({
                        name: item.replace(/ /g, '-').toLowerCase(),
                        description: item,
                        type: expectedArgsTypes && expectedArgsTypes.length >= a
                            ? expectedArgsTypes[a]
                            : 'STRING',
                        required: a < minArgs,
                    });
                }
            }
            const slashCommands = instance.slashCommands;
            if (testOnly) {
                for (const id of instance.testServers) {
                    await slashCommands.create(names[0], description, options, id);
                }
            }
            else {
                await slashCommands.create(names[0], description, options);
            }
        }
        if (callback) {
            if (init) {
                init(client, instance);
            }
            const command = new Command_1.default(instance, client, names, callback, error, configuration);
            for (const name of names) {
                // Ensure the alias is lower case because we read as lower case later on
                this._commands.set(name.toLowerCase(), command);
            }
        }
    }
    get commands() {
        const results = [];
        const added = [];
        this._commands.forEach(({ names, category = '', description = '', expectedArgs = '', hidden = false, testOnly = false, }) => {
            if (!added.includes(names[0])) {
                results.push({
                    names: [...names],
                    category,
                    description,
                    syntax: expectedArgs,
                    hidden,
                    testOnly,
                });
                added.push(names[0]);
            }
        });
        return results;
    }
    getCommandsByCategory(category, visibleOnly) {
        const results = [];
        for (const command of this.commands) {
            if (visibleOnly && command.hidden) {
                continue;
            }
            if (command.category === category) {
                results.push(command);
            }
        }
        return results;
    }
    getCommand(name) {
        return this._commands.get(name);
    }
    getICommand(name) {
        return this.commands.find((command) => command.names?.includes(name));
    }
    async fetchDisabledCommands() {
        const results = await disabled_commands_1.default.find({});
        for (const result of results) {
            const { guildId, command } = result;
            this._commands.get(command)?.disable(guildId);
        }
    }
    async fetchRequiredRoles() {
        const results = await required_roles_1.default.find({});
        for (const result of results) {
            const { guildId, command, requiredRoles } = result;
            const cmd = this._commands.get(command);
            if (cmd) {
                for (const roleId of requiredRoles) {
                    cmd.addRequiredRole(guildId, roleId);
                }
            }
        }
    }
    async fetchChannelOnly() {
        const results = await channel_commands_1.default.find({});
        for (const result of results) {
            const { command, guildId, channels } = result;
            const cmd = this._commands.get(command);
            if (!cmd) {
                continue;
            }
            const guild = this._client?.guilds.cache.get(guildId);
            if (!guild) {
                continue;
            }
            cmd.setRequiredChannels(guild, command, channels
                .toString()
                .replace(/\"\[\]/g, '')
                .split(','));
        }
    }
}
exports.default = CommandHandler;
