import { Client } from 'discord.js'
import WOKCommands from '../..'
import ICommandArguments from '../../interfaces/ICommandArguments'
import getFirstEmbed from './get-first-embed'
import ReactionListener, { addReactions } from './ReactionListener'

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
    const { message, instance } = options

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

    const { embed, reactions } = getFirstEmbed(message, instance)

    message.channel
      .send('', {
        embed,
      })
      .then((message) => {
        addReactions(message, reactions)
      })
  },
}
