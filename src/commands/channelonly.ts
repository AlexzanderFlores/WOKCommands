import { ICallbackObject, ICommand } from '../..'
import channelCommandSchema from '../models/channel-commands'

export = {
  description: 'Makes a command only work in some channels.',
  category: 'Configuration',

  permissions: ['ADMINISTRATOR'],

  minArgs: 1,
  maxArgs: 2,
  expectedArgs: '<Command name> [Channel tag]',

  cooldown: '2s',
  guildOnly: true,

  slash: 'both',

  options: [
    {
      name: 'command',
      description: 'The command name',
      type: 'STRING',
      required: true,
    },
    {
      name: 'channel',
      description: 'The tag of the channel',
      type: 'CHANNEL',
      required: false,
    },
  ],

  callback: async (options: ICallbackObject) => {
    const { message, channel, args, instance, interaction } = options
    const { guild } = channel

    const { messageHandler } = instance

    let commandName = (args.shift() || '').toLowerCase()
    const command = instance.commandHandler.getCommand(commandName)

    if (!instance.isDBConnected()) {
      return messageHandler.get(guild, 'NO_DATABASE_FOUND')
    }

    if (!command || !command.names) {
      return messageHandler.get(guild, 'UNKNOWN_COMMAND', {
        COMMAND: commandName,
      })
    }

    commandName = command.names[0]

    if (args.length === 0) {
      const results = await channelCommandSchema.deleteMany({
        guildId: guild?.id,
        command: commandName,
      })

      // @ts-ignore
      if (results.n === 0) {
        return messageHandler.get(guild, 'NOT_CHANNEL_COMMAND')
      }

      command.setRequiredChannels(guild, commandName, [])

      return messageHandler.get(guild, 'NO_LONGER_CHANNEL_COMMAND')
    }

    if (message?.mentions.channels.size === 0) {
      return messageHandler.get(guild, 'NO_TAGGED_CHANNELS')
    }

    let channels

    if (message) {
      channels = Array.from(message.mentions.channels.keys())
    } else {
      channels = [interaction.options.getChannel('channel')]
    }

    const results = await channelCommandSchema.findOneAndUpdate(
      {
        guildId: guild?.id,
        command: commandName,
      },
      {
        guildId: guild?.id,
        command: commandName,
        $addToSet: {
          channels,
        },
      },
      {
        upsert: true,
        new: true,
      }
    )

    if (results) {
      command.setRequiredChannels(guild, commandName, results.channels)
    }

    return messageHandler.get(guild, 'NOW_CHANNEL_COMMAND', {
      COMMAND: commandName,
      CHANNELS: args.join(' '),
    })
  },
} as ICommand
