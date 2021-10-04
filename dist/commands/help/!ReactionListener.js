"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addReactions = void 0;
const _get_first_embed_1 = __importDefault(require("./!get-first-embed"));
const /**
   * Recursively adds reactions to the message
   * @param message The message to react to
   * @param reactions A list of reactions to add
   */ addReactions = (message, reactions) => {
    const emoji = reactions.shift();
    if (emoji) {
        message.react(emoji);
        addReactions(message, reactions);
    }
};
exports.addReactions = addReactions;
class ReactionHandler {
    instance;
    reaction;
    user;
    message;
    embed;
    guild = null;
    emojiName = '';
    emojiId = '';
    door = '🚪';
    pageLimit = 3;
    constructor(instance, reaction, user) {
        this.instance = instance;
        this.reaction = reaction;
        this.user = user;
        this.message = reaction.message;
        this.init();
    }
    init = async () => {
        if (this.message.partial) {
            await this.message.fetch();
        }
        const { embeds, guild } = this.message;
        if (this.user.bot || !embeds || embeds.length !== 1) {
            return;
        }
        this.embed = embeds[0];
        this.guild = guild;
        if (!this.canUserInteract()) {
            return;
        }
        this.emojiName = this.reaction.emoji.name;
        this.emojiId = this.reaction.emoji.id || '';
        this.handleEmoji();
    };
    /**
     * @returns If the bot has access to remove reactions from the help menu
     */
    canBotRemoveReaction = () => {
        return (this.message.channel.type !== 'DM' &&
            this.message.member?.permissions.has('MANAGE_MESSAGES'));
    };
    /**
     * @returns If the user is allowed to interact with this help menu
     */
    canUserInteract = () => {
        // Check if the title of the embed is correct
        const displayName = this.instance.displayName
            ? this.instance.displayName + ' '
            : '';
        const isSameTitle = this.embed.title ===
            `${displayName}${this.instance.messageHandler.getEmbed(this.guild, 'HELP_MENU', 'TITLE')}`;
        if (!isSameTitle) {
            return false;
        }
        // Check if the user's ID is in the footer
        if (this.embed.footer) {
            const { text } = this.embed.footer;
            const id = text?.split('#')[1];
            if (id !== this.user.id) {
                if (this.canBotRemoveReaction()) {
                    this.reaction.users.remove(this.user.id);
                }
                return false;
            }
        }
        return true;
    };
    /**
     * Invoked when the user returns to the main menu
     */
    returnToMainMenu = () => {
        const { embed: newEmbed, reactions } = _get_first_embed_1.default(this.message, this.instance);
        this.embed.setDescription(newEmbed.description || '');
        this.message.edit({ embeds: [this.embed] });
        if (this.canBotRemoveReaction()) {
            this.message.reactions.removeAll();
        }
        addReactions(this.message, reactions);
    };
    /**
     * @param commandLength How many commands are in the category
     * @returns An array of [page, maxPages]
     */
    getMaxPages = (commandLength) => {
        let page = 1;
        if (this.embed && this.embed.description) {
            const split = this.embed.description.split('\n');
            const lastLine = split[split.length - 1];
            if (lastLine.startsWith('Page ')) {
                page = parseInt(lastLine.split(' ')[1]);
            }
        }
        return [page, Math.ceil(commandLength / this.pageLimit)];
    };
    /**
     * @returns An object containing information regarding the commands
     */
    getCommands = () => {
        let category = this.instance.getCategory(this.emojiId || this.emojiName);
        const commandsString = this.instance.messageHandler.getEmbed(this.guild, 'HELP_MENU', 'COMMANDS');
        if (this.embed.description) {
            const split = this.embed.description.split('\n');
            const cmdStr = ' ' + commandsString;
            if (split[0].endsWith(cmdStr)) {
                category = split[0].replace(cmdStr, '');
            }
        }
        const commands = this.instance.commandHandler.getCommandsByCategory(category);
        return {
            length: commands.length,
            commands,
            commandsString,
            category,
        };
    };
    static getHelp = (command, instance, guild) => {
        const { description, syntax, names } = command;
        if (names === undefined) {
            console.error('WOKCommands > A command does not have a name assigned to it.');
            return '';
        }
        const mainName = typeof names === 'string' ? names : names.shift();
        let desc = `**${mainName}**${description ? ' - ' : ''}${description}`;
        if (names.length && typeof names !== 'string') {
            desc += `\n${instance.messageHandler.getEmbed(guild, 'HELP_MENU', 'ALIASES')}: "${names.join('", "')}"`;
        }
        desc += `\n${instance.messageHandler.getEmbed(guild, 'HELP_MENU', 'SYNTAX')}: "${instance.getPrefix(guild)}${mainName}${syntax ? ' ' : ''}${syntax || ''}"`;
        return desc;
    };
    /**
     * Generates the actual menu
     */
    generateMenu = (page, maxPages) => {
        const { length, commands, commandsString, category } = this.getCommands();
        const hasMultiplePages = length > this.pageLimit;
        let desc = `${category} ${commandsString}\n\n${this.instance.messageHandler.getEmbed(this.guild, 'HELP_MENU', 'DESCRIPTION_FIRST_LINE')}`;
        if (hasMultiplePages) {
            desc += `\n\n${this.instance.messageHandler.getEmbed(this.guild, 'HELP_MENU', 'DESCRIPTION_SECOND_LINE')}`;
        }
        const start = (page - 1) * this.pageLimit;
        for (let a = start, counter = a; a < commands.length && a < start + this.pageLimit; ++a) {
            const command = commands[a];
            let { hidden, category, names } = command;
            if (!hidden && category === category) {
                if (typeof names === 'string') {
                    // @ts-ignore
                    names = [...names];
                }
                desc += `\n\n#${++counter}) ${ReactionHandler.getHelp(command, this.instance, this.guild)}`;
            }
        }
        desc += `\n\nPage ${page} / ${maxPages}.`;
        this.embed.setDescription(desc);
        this.message.edit({ embeds: [this.embed] });
        if (this.canBotRemoveReaction()) {
            this.message.reactions.removeAll();
        }
        const reactions = [];
        if (hasMultiplePages) {
            reactions.push('⬅');
            reactions.push('➡');
        }
        reactions.push('🚪');
        addReactions(this.message, reactions);
    };
    /**
     * Handles the input from the emoji
     */
    handleEmoji = () => {
        if (this.emojiName === this.door) {
            this.returnToMainMenu();
            return;
        }
        const { length } = this.getCommands();
        let [page, maxPages] = this.getMaxPages(length);
        if (this.emojiName === '⬅') {
            if (page <= 1) {
                if (this.canBotRemoveReaction()) {
                    this.reaction.users.remove(this.user.id);
                }
                return;
            }
            --page;
        }
        else if (this.emojiName === '➡') {
            if (page >= maxPages) {
                if (this.canBotRemoveReaction()) {
                    this.reaction.users.remove(this.user.id);
                }
                return;
            }
            ++page;
        }
        this.generateMenu(page, maxPages);
    };
}
exports.default = ReactionHandler;
