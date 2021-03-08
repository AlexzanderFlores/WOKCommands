import { Message, MessageEmbed } from 'discord.js';
import WOKCommands from '../../';
declare const getFirstEmbed: (message: Message, instance: WOKCommands) => {
    embed: MessageEmbed;
    reactions: string[];
};
export default getFirstEmbed;
