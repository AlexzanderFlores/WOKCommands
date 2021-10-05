"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const cooldown_1 = __importDefault(require("./models/cooldown"));
class Command {
    instance;
    client;
    _names = [];
    _category = '';
    _minArgs = 0;
    _maxArgs = -1;
    _syntaxError;
    _expectedArgs;
    _description;
    _requiredPermissions;
    _requiredRoles = new Map(); // <GuildID, RoleIDs[]>
    _callback = () => { };
    _error = null;
    _disabled = [];
    _cooldownDuration = 0;
    _cooldownChar = '';
    _cooldown;
    _userCooldowns = new Map(); // <GuildID-UserID, Seconds> OR <dm-UserID, Seconds>
    _globalCooldown;
    _guildCooldowns = new Map(); // <GuildID, Seconds>
    _databaseCooldown = false;
    _ownerOnly = false;
    _hidden = false;
    _guildOnly = false;
    _testOnly = false;
    _slash = false;
    _requireRoles = false;
    _requiredChannels = new Map(); // <GuildID-Command, Channel IDs>
    constructor(instance, client, names, callback, error, { category, minArgs, maxArgs, syntaxError, expectedArgs, description, requiredPermissions, permissions, cooldown, globalCooldown, ownerOnly = false, hidden = false, guildOnly = false, testOnly = false, slash = false, requireRoles = false, }) {
        this.instance = instance;
        this.client = client;
        this._names = typeof names === 'string' ? [names] : names;
        this._category = category;
        this._minArgs = minArgs || 0;
        this._maxArgs = maxArgs === undefined ? -1 : maxArgs;
        this._syntaxError = syntaxError;
        this._expectedArgs = expectedArgs;
        this._description = description;
        this._requiredPermissions = requiredPermissions || permissions;
        this._cooldown = cooldown || '';
        this._globalCooldown = globalCooldown || '';
        this._ownerOnly = ownerOnly;
        this._hidden = hidden;
        this._guildOnly = guildOnly;
        this._testOnly = testOnly;
        this._callback = callback;
        this._error = error;
        this._slash = slash;
        this._requireRoles = requireRoles;
        if (this.cooldown && this.globalCooldown) {
            throw new Error(`Command "${names[0]}" has both a global and per-user cooldown. Commands can only have up to one of these properties.`);
        }
        if (requiredPermissions && permissions) {
            throw new Error(`Command "${names[0]}" has both requiredPermissions and permissions fields. These are interchangeable but only one should be provided.`);
        }
        if (this.cooldown) {
            this.verifyCooldown(this._cooldown, 'cooldown');
        }
        if (this.globalCooldown) {
            this.verifyCooldown(this._globalCooldown, 'global cooldown');
        }
        if (this._minArgs < 0) {
            throw new Error(`Command "${names[0]}" has a minimum argument count less than 0!`);
        }
        if (this._maxArgs < -1) {
            throw new Error(`Command "${names[0]}" has a maximum argument count less than -1!`);
        }
        if (this._maxArgs !== -1 && this._maxArgs < this._minArgs) {
            throw new Error(`Command "${names[0]}" has a maximum argument count less than it's minimum argument count!`);
        }
    }
    async execute(message, args) {
        const reply = await this._callback({
            message,
            channel: message.channel,
            args,
            text: args.join(' '),
            client: this.client,
            prefix: this.instance.getPrefix(message.guild),
            instance: this.instance,
            user: message.author,
            member: message.member,
            guild: message.guild,
            cancelCoolDown: () => {
                this.decrementCooldowns(message.guild?.id, message.author.id);
            },
        });
        if (!reply) {
            return;
        }
        if (typeof reply === 'string') {
            message.reply({
                content: reply,
            });
        }
        else if (typeof reply === 'object') {
            if (reply.custom) {
                message.reply(reply);
            }
            else {
                let embeds = [];
                if (Array.isArray(reply)) {
                    embeds = reply;
                }
                else {
                    embeds.push(reply);
                }
                message.reply({
                    embeds,
                });
            }
        }
    }
    get names() {
        return this._names;
    }
    get category() {
        return this._category;
    }
    get description() {
        return this._description;
    }
    get minArgs() {
        return this._minArgs;
    }
    get maxArgs() {
        return this._maxArgs;
    }
    get syntaxError() {
        return this._syntaxError || {};
    }
    get expectedArgs() {
        return this._expectedArgs;
    }
    get requiredPermissions() {
        return this._requiredPermissions;
    }
    get cooldownDuration() {
        return this._cooldownDuration;
    }
    get cooldownChar() {
        return this._cooldownChar;
    }
    get cooldown() {
        return this._cooldown;
    }
    get globalCooldown() {
        return this._globalCooldown;
    }
    get testOnly() {
        return this._testOnly;
    }
    verifyCooldown(cooldown, type) {
        if (typeof cooldown !== 'string') {
            throw new Error(`Invalid ${type} format! Must be a string, examples: "10s" "5m" etc.`);
        }
        const results = cooldown.match(/[a-z]+|[^a-z]+/gi) || [];
        if (results.length !== 2) {
            throw new Error(`Invalid ${type} format! Please provide "<Duration><Type>", examples: "10s" "5m" etc.`);
        }
        this._cooldownDuration = +results[0];
        if (isNaN(this._cooldownDuration)) {
            throw new Error(`Invalid ${type} format! Number is invalid.`);
        }
        this._cooldownChar = results[1];
        if (this._cooldownChar !== 's' &&
            this._cooldownChar !== 'm' &&
            this._cooldownChar !== 'h' &&
            this._cooldownChar !== 'd') {
            throw new Error(`Invalid ${type} format! Unknown type. Please provide 's', 'm', 'h', or 'd' for seconds, minutes, hours, or days respectively.`);
        }
        if (type === 'global cooldown' &&
            this._cooldownChar === 's' &&
            this._cooldownDuration < 60) {
            throw new Error(`Invalid ${type} format! The minimum duration for a global cooldown is 1m.`);
        }
        const moreInfo = ' For more information please see https://docs.wornoffkeys.com/commands/command-cooldowns';
        if (this._cooldownDuration < 1) {
            throw new Error(`Invalid ${type} format! Durations must be at least 1.${moreInfo}`);
        }
        if ((this._cooldownChar === 's' || this._cooldownChar === 'm') &&
            this._cooldownDuration > 60) {
            throw new Error(`Invalid ${type} format! Second or minute durations cannot exceed 60.${moreInfo}`);
        }
        if (this._cooldownChar === 'h' && this._cooldownDuration > 24) {
            throw new Error(`Invalid ${type} format! Hour durations cannot exceed 24.${moreInfo}`);
        }
        if (this._cooldownChar === 'd' && this._cooldownDuration > 365) {
            throw new Error(`Invalid ${type} format! Day durations cannot exceed 365.${moreInfo}`);
        }
    }
    get hidden() {
        return this._hidden;
    }
    get guildOnly() {
        return this._guildOnly;
    }
    get ownerOnly() {
        return this._ownerOnly;
    }
    verifyDatabaseCooldowns() {
        if (this._cooldownChar === 'd' ||
            this._cooldownChar === 'h' ||
            (this._cooldownChar === 'm' && this._cooldownDuration >= 5)) {
            this._databaseCooldown = true;
            if (!this.instance.isDBConnected()) {
                console.warn(`WOKCommands > A database connection is STRONGLY RECOMMENDED for cooldowns of 5 minutes or more.`);
            }
        }
    }
    /**
     * Decrements per-user and global cooldowns
     * Deletes expired cooldowns
     */
    decrementCooldowns(guildId, userId) {
        for (const map of [this._userCooldowns, this._guildCooldowns]) {
            if (typeof map !== 'string') {
                map.forEach((value, key) => {
                    if (key === `${guildId}-${userId}`) {
                        value = 0;
                    }
                    if (--value <= 0) {
                        map.delete(key);
                    }
                    else {
                        map.set(key, value);
                    }
                    if (this._databaseCooldown && this.instance.isDBConnected()) {
                        this.updateDatabaseCooldowns(`${this.names[0]}-${key}`, value);
                    }
                });
            }
        }
    }
    async updateDatabaseCooldowns(_id, cooldown) {
        // Only update every 20s
        if (cooldown % 20 === 0 && this.instance.isDBConnected()) {
            const type = this.globalCooldown ? 'global' : 'per-user';
            if (cooldown <= 0) {
                await cooldown_1.default.deleteOne({ _id, name: this.names[0], type });
            }
            else {
                await cooldown_1.default.findOneAndUpdate({
                    _id,
                    name: this.names[0],
                    type,
                }, {
                    _id,
                    name: this.names[0],
                    type,
                    cooldown,
                }, { upsert: true });
            }
        }
    }
    setCooldown(guildId, userId, customCooldown) {
        const target = this.globalCooldown || this.cooldown;
        if (target) {
            let seconds = customCooldown || this._cooldownDuration;
            const durationType = customCooldown ? 's' : this._cooldownChar;
            switch (durationType) {
                case 'm':
                    seconds *= 60;
                    break;
                case 'h':
                    seconds *= 60 * 60;
                    break;
                case 'd':
                    seconds *= 60 * 60 * 24;
                    break;
            }
            // Increment to ensure we save it to the database when it is divisible by 20
            ++seconds;
            if (this.globalCooldown) {
                this._guildCooldowns.set(guildId, seconds);
            }
            else {
                this._userCooldowns.set(`${guildId}-${userId}`, seconds);
            }
        }
    }
    getCooldownSeconds(guildId, userId) {
        let seconds = this.globalCooldown
            ? this._guildCooldowns.get(guildId)
            : this._userCooldowns.get(`${guildId}-${userId}`);
        if (!seconds) {
            return '';
        }
        const days = Math.floor(seconds / (3600 * 24));
        const hours = Math.floor((seconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        seconds = Math.floor(seconds % 60);
        let result = '';
        if (days) {
            result += `${days}d `;
        }
        if (hours) {
            result += `${hours}h `;
        }
        if (minutes) {
            result += `${minutes}m `;
        }
        if (seconds) {
            result += `${seconds}s `;
        }
        return result.substring(0, result.length - 1);
    }
    addRequiredRole(guildId, roleId) {
        const array = this._requiredRoles?.get(guildId) || [];
        if (!array.includes(roleId)) {
            array.push(roleId);
            this._requiredRoles?.set(guildId, array);
        }
    }
    removeRequiredRole(guildId, roleId) {
        if (roleId === 'none') {
            this._requiredRoles?.delete(guildId);
            return;
        }
        const array = this._requiredRoles?.get(guildId) || [];
        const index = array ? array.indexOf(roleId) : -1;
        if (array && index >= 0) {
            array.splice(index, 1);
        }
    }
    getRequiredRoles(guildId) {
        const map = this._requiredRoles || new Map();
        return map.get(guildId) || [];
    }
    get callback() {
        return this._callback;
    }
    disable(guildId) {
        if (!this._disabled.includes(guildId)) {
            this._disabled.push(guildId);
        }
    }
    enable(guildId) {
        const index = this._disabled.indexOf(guildId);
        if (index >= 0) {
            this._disabled.splice(index, 1);
        }
    }
    isDisabled(guildId) {
        return this._disabled.includes(guildId);
    }
    get error() {
        return this._error;
    }
    get slash() {
        return this._slash;
    }
    get doesRequireRoles() {
        return this._requireRoles;
    }
    get requiredChannels() {
        return this._requiredChannels;
    }
    setRequiredChannels(guild, command, channels) {
        if (!guild) {
            return;
        }
        this.requiredChannels.set(`${guild.id}-${command}`, channels);
    }
}
module.exports = Command;
