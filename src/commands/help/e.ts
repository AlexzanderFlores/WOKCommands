import { Client, Message, MessageEmbed } from 'discord.js'
import WOKCommands from '../..'
import { ICallbackObject, ICommand } from '../../../typings'
import getFirstEmbed from './!get-first-embed'
import ReactionListener, { addReactions } from './!ReactionListener'

const sendHelpMenu = (interaction: any, instance: WOKCommands) => {
    const { embed, reactions } = getFirstEmbed.default(interaction, instance);
    interaction
        .reply({
        embeds: [embed],
        fetchReply: true,
    })
        .then((msg: any) => {
            getFirstEmbed.addReactions(msg, reactions);
    });
};
module.exports = {
    description: "Displays this bot's commands",
    category: 'Help',
    aliases: 'commands',
    maxArgs: 1,
    expectedArgs: '<command>',
    slash: true,
    guildOnly: true,
    options: [
        {
          name: 'command',
          description: 'Option to get help on a specific command.',
          type: 3,
          required: false
        },
    ],
    init: (client: Client, instance: WOKCommands) => {
        client.on('messageReactionAdd', async (reaction, user) => {
            new ReactionListener(instance, reaction, user)
        })
    },
    callback: (options: ICallbackObject) => {
        const { interaction, channel, instance, args } = options;
        const { guild } = channel;
        if (guild && !guild.me?.permissions.has('SEND_MESSAGES')) {
            console.warn(`WOKCommands > Could not send message due to no permissions in channel for ${guild.name}`);
            return;
        }
        if (guild && !guild.me?.permissions.has('ADD_REACTIONS')) {
            return instance.messageHandler.get(guild, 'NO_REACT_PERMS');
        }
        // Typical "/help" syntax for the menu
        if (args.length === 0) {
            sendHelpMenu(interaction, instance);
            return;
        }
        // If the user is looking for info on a specific command
        // Ex: "/help prefix"
        const arg = args.shift()?.toLowerCase()!

        const command = instance.commandHandler.getICommand(arg)
        if (!command) {
          return instance.messageHandler.get(guild, 'UNKNOWN_COMMAND', {
            COMMAND: arg,
          })
        }
        const description = ReactionListener.getHelp(command, instance, guild);
        const embed = new MessageEmbed()
            .setTitle(`${instance.displayName} ${instance.messageHandler.getEmbed(guild, 'HELP_MENU', 'TITLE')} - ${arg}`)
            .setDescription(description);
        if (instance.color) {
            embed.setColor(instance.color);
        }
        return embed;
    },
};