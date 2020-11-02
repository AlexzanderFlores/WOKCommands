import { Client, Message } from 'discord.js'
import WOKCommands from '..'
import prefixes from '../models/prefixes'

export = {
  minArgs: 0,
  maxArgs: 1,
  expectedArgs: '[New Prefix]',
  requiredPermissions: ['ADMINISTRATOR'],
  description: 'Displays or sets the prefix for the current guild',
  callback: async (
    message: Message,
    args: string[],
    text: string,
    client: Client,
    prefix: string,
    instance: WOKCommands
  ) => {
    if (args.length === 0) {
      message.reply(`The current prefix is "${prefix}"`)
    } else {
      const { guild } = message

      if (guild) {
        const { id } = guild

        await prefixes.findOneAndUpdate(
          {
            _id: id,
          },
          {
            _id: id,
            prefix: text,
          },
          {
            upsert: true,
          }
        )

        instance.setPrefix(guild, text)

        message.reply(`Set prefix to "${text}"`)
      } else {
        message.reply('You cannot set a prefix in a private message.')
      }
    }
  },
}
