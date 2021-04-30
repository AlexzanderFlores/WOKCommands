import { Client, Message, MessageEmbed } from 'discord.js'
import WOKCommands from '../..'
import ICommandArguments from '../../interfaces/ICommandArguments'
import getFirstEmbed from './!get-first-embed'
import ReactionListener, { addReactions } from './!ReactionListener'

const sendHelpMenu = (message: Message, instance: WOKCommands) => {
  const { embed, reactions } = getFirstEmbed(message, instance)

  message.channel
    .send('', {
      embed,
    })
    .then((message) => {
      addReactions(message, reactions)
    })
}

module.exports = {
  aliases: 'commands',
  maxArgs: 1,
  expectedArgs: '[command]',
  description: "Displays this bot's commands",
  category: 'Help',
  init: (client: Client, instance: WOKCommands) => {
    client.on('messageReactionAdd', async (reaction, user) => {
      new ReactionListener(instance, reaction, user)
    })
  },
  callback: (options: ICommandArguments) => {
    const { message, instance, args } = options

    const guild = message.guild

    if (guild && !guild.me?.hasPermission('SEND_MESSAGES')) {
      console.warn(
        `WOKCommands > Could not send message due to no permissions in channel for ${guild.name}`
      )
      return
    }

    if (guild && !guild.me?.hasPermission('ADD_REACTIONS')) {
      message.reply(instance.messageHandler.get(guild, 'NO_REACT_PERMS'))
      return
    }

    // Typical "!help" syntax for the menu
    if (args.length === 0) {
      sendHelpMenu(message, instance)
      return
    }

    // If the user is looking for info on a specific command
    // Ex: "!help prefix"
    const arg = args.shift()?.toLowerCase()!

    const command = instance.commandHandler.getICommand(arg)
    if (!command) {
      message.reply(
        instance.messageHandler.get(guild, 'UNKNOWN_COMMAND', {
          COMMAND: arg,
        })
      )
      return
    }

    const description = ReactionListener.getHelp(command, instance, guild)
    const embed = new MessageEmbed()
      .setTitle(
        `${instance.displayName} ${instance.messageHandler.getEmbed(
          guild,
          'HELP_MENU',
          'TITLE'
        )} - ${arg}`
      )
      .setDescription(description)

    if (instance.color) {
      embed.setColor(instance.color)
    }

    message.channel.send('', { embed })
  },
}
