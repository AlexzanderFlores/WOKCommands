"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
class CommandHandler {
    _commands = new Map();
    _client = null;
    constructor(instance, client, dir, disabledDefaultCommands, typeScript = false) {
        this._client = client;
        // Register built in commands
        for (const [file, fileName] of get_all_files_1.default(path_1.default.join(__dirname, 'commands'))) {
            if (disabledDefaultCommands.includes(fileName)) {
                continue;
            }
            this.registerCommand(instance, client, file, fileName);
        }
        if (dir) {
            if (!fs_1.default.existsSync(dir)) {
                throw new Error(`Commands directory "${dir}" doesn't exist!`);
            }
            const files = get_all_files_1.default(dir, typeScript ? '.ts' : '');
            const amount = files.length;
            console.log(`WOKCommands > Loaded ${amount} command${amount === 1 ? '' : 's'}.`);
            for (const [file, fileName] of files) {
                this.registerCommand(instance, client, file, fileName);
            }
            client.on('messageCreate', (message) => {
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
                const args = content.split(/ /g);
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
                if (guild) {
                    const isDisabled = command.isDisabled(guild.id);
                    if (isDisabled) {
                        if (error) {
                            error({
                                error: CommandErrors_1.default.COMMAND_DISABLED,
                                command,
                                message,
                            });
                        }
                        else {
                            message
                                .reply(instance.messageHandler.get(guild, 'DISABLED_COMMAND'))
                                .then((message) => {
                                if (instance.delErrMsgCooldown === -1) {
                                    return;
                                }
                                setTimeout(() => {
                                    message.delete();
                                }, 1000 * instance.delErrMsgCooldown);
                            });
                        }
                        return;
                    }
                }
                const { member, author: user } = message;
                const { minArgs, maxArgs, expectedArgs, requiredPermissions, cooldown, globalCooldown, testOnly, } = command;
                if (testOnly && (!guild || !instance.testServers.includes(guild.id))) {
                    return;
                }
                if (guild && member) {
                    for (const perm of requiredPermissions || []) {
                        // @ts-ignore
                        if (!member.permissions.has(perm)) {
                            if (error) {
                                error({
                                    error: CommandErrors_1.default.MISSING_PERMISSIONS,
                                    command,
                                    message,
                                });
                            }
                            else {
                                message
                                    .reply(instance.messageHandler.get(guild, 'MISSING_PERMISSION', {
                                    PERM: perm,
                                }))
                                    .then((message) => {
                                    if (instance.delErrMsgCooldown === -1) {
                                        return;
                                    }
                                    setTimeout(() => {
                                        message.delete();
                                    }, 1000 * instance.delErrMsgCooldown);
                                });
                            }
                            return;
                        }
                    }
                    const roles = command.getRequiredRoles(guild.id);
                    if (roles && roles.length) {
                        const missingRoles = [];
                        const missingRolesNames = [];
                        for (const role of roles) {
                            if (!member.roles.cache.has(role)) {
                                missingRoles.push(role);
                                missingRolesNames.push(guild.roles.cache.get(role)?.name);
                            }
                        }
                        if (missingRoles.length) {
                            if (error) {
                                error({
                                    error: CommandErrors_1.default.MISSING_ROLES,
                                    command,
                                    message,
                                    info: {
                                        missingRoles,
                                    },
                                });
                            }
                            else {
                                message
                                    .reply(instance.messageHandler.get(guild, 'MISSING_ROLES', {
                                    ROLES: missingRolesNames.join(', '),
                                }))
                                    .then((message) => {
                                    if (instance.delErrMsgCooldown === -1) {
                                        return;
                                    }
                                    setTimeout(() => {
                                        message.delete();
                                    }, 1000 * instance.delErrMsgCooldown);
                                });
                            }
                            return;
                        }
                    }
                }
                // Are the proper number of arguments provided?
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
                            message,
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
                        message.reply(errorMsg);
                    }
                    return;
                }
                // Check for cooldowns
                if ((cooldown || globalCooldown) && user) {
                    const guildId = guild ? guild.id : 'dm';
                    const timeLeft = command.getCooldownSeconds(guildId, user.id);
                    if (timeLeft) {
                        if (error) {
                            error({
                                error: CommandErrors_1.default.COOLDOWN,
                                command,
                                message,
                                info: {
                                    timeLeft,
                                },
                            });
                        }
                        else {
                            message.reply(instance.messageHandler.get(guild, 'COOLDOWN', {
                                COOLDOWN: timeLeft,
                            }));
                        }
                        return;
                    }
                    command.setCooldown(guildId, user.id);
                }
                // Check for channel specific commands
                if (guild) {
                    const key = `${guild.id}-${command.names[0]}`;
                    const channels = command.requiredChannels.get(key);
                    if (channels &&
                        channels.length &&
                        !channels.includes(message.channel.id)) {
                        let channelList = '';
                        for (const channel of channels) {
                            channelList += `<#${channel}>, `;
                        }
                        channelList = channelList.substring(0, channelList.length - 2);
                        message.reply(instance.messageHandler.get(guild, 'ALLOWED_CHANNELS', {
                            CHANNELS: channelList,
                        }));
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
            // If we cannot connect to a database then ensure all cooldowns are less than 5m
            instance.on(Events_1.default.DATABASE_CONNECTED, async (connection, state) => {
                const connected = state === 'Connected';
                if (!connected) {
                    return;
                }
                // Load previously used cooldowns
                await this.fetchDisabledCommands();
                await this.fetchRequiredRoles();
                await this.fetchChannelOnly();
                this._commands.forEach(async (command) => {
                    command.verifyDatabaseCooldowns(connected);
                    const results = await cooldown_1.default.find({
                        name: command.names[0],
                        type: command.globalCooldown ? 'global' : 'per-user',
                    });
                    // @ts-ignore
                    for (const { _id, cooldown } of results) {
                        const [name, guildId, userId] = _id.split('-');
                        command.setCooldown(guildId, userId, cooldown);
                    }
                });
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
    async registerCommand(instance, client, file, fileName) {
        let configuration = await Promise.resolve().then(() => __importStar(require(file)));
        // person is using 'export default' so we import the default instead
        if (configuration.default && Object.keys(configuration).length === 1) {
            configuration = configuration.default;
        }
        const { name = fileName, category, commands, aliases, init, callback, run, execute, error, description, requiredPermissions, permissions, testOnly, slash, expectedArgs, minArgs, options = [], } = configuration;
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
        if (slash) {
            if (!description) {
                throw new Error(`WOKCommands > A description is required for command "${names[0]}" because it is a slash command.`);
            }
            if (minArgs !== undefined && !expectedArgs) {
                throw new Error(`WOKCommands > Command "${names[0]}" has "minArgs" property defined without "expectedArgs" property as a slash command.`);
            }
            const slashCommands = instance.slashCommands;
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
                        type: 3,
                        required: a < minArgs,
                    });
                }
            }
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
