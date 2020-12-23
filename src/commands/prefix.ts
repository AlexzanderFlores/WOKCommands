import ICommandArguments from '../interfaces/ICommandArguments'
import prefixes from '../models/prefixes'

export = {
  maxArgs: 1,
  cooldown: '2s',
  expectedArgs: '[New Prefix]',
  requiredPermissions: ['ADMINISTRATOR'],
  description: 'Displays or sets the prefix for the current guild',
  category: 'Configuration',
  callback: async (options: ICommandArguments) => {
    const { message, args, text, prefix, instance } = options

    const { guild } = message

    if (args.length === 0) {
      message.reply(
        instance.messageHandler.get(guild, 'CURRENT_PREFIX', {
          PREFIX: prefix,
        })
      )
    } else {
      if (guild) {
        const { id } = guild

        if (!instance.isDBConnected()) {
          message.reply(instance.messageHandler.get(guild, 'NO_DATABASE_FOUND'))
          return
        }

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

        message.reply(
          instance.messageHandler.get(guild, 'SET_PREFIX', {
            PREFIX: text,
          })
        )
      } else {
        message.reply(
          instance.messageHandler.get(guild, 'CANNOT_SET_PREFIX_IN_DMS')
        )
      }
    }
  },
}
