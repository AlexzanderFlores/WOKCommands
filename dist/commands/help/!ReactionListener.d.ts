import { Guild, Message, MessageEmbed, MessageReaction, PartialUser, User } from 'discord.js';
import WOKCommands from '../..';
import ICommand from '../../interfaces/ICommand';
declare const /**
   * Recursively adds reactions to the message
   * @param message The message to react to
   * @param reactions A list of reactions to add
   */ addReactions: (message: Message, reactions: string[]) => void;
declare class ReactionHandler {
    instance: WOKCommands;
    reaction: MessageReaction;
    user: PartialUser | User;
    message: Message;
    embed: MessageEmbed;
    guild: Guild | null;
    emojiName: string;
    emojiId: string;
    door: string;
    pageLimit: number;
    constructor(instance: WOKCommands, reaction: MessageReaction, user: PartialUser | User);
    init: () => Promise<void>;
    /**
     * @returns If the bot has access to remove reactions from the help menu
     */
    canBotRemoveReaction: () => boolean | undefined;
    /**
     * @returns If the user is allowed to interact with this help menu
     */
    canUserInteract: () => boolean;
    /**
     * Invoked when the user returns to the main menu
     */
    returnToMainMenu: () => void;
    /**
     * @param commandLength How many commands are in the category
     * @returns An array of [page, maxPages]
     */
    getMaxPages: (commandLength: number) => number[];
    /**
     * @returns An object containing information regarding the commands
     */
    getCommands: () => {
        length: number;
        commands: ICommand[];
        commandsString: string;
        category: string;
    };
    static getHelp: (command: ICommand, instance: WOKCommands, guild: Guild | null) => string;
    /**
     * Generates the actual menu
     */
    generateMenu: (page: number, maxPages: number) => void;
    /**
     * Handles the input from the emoji
     */
    handleEmoji: () => void;
}
export default ReactionHandler;
export { addReactions };
