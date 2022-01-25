import { ICallbackObject, ICommand } from '../types'

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

    if (args.length === 0) {

      await command.setRequiredChannels({ guildId: guild?.id, channels: [] })

      return messageHandler.get(guild, 'NO_LONGER_CHANNEL_COMMAND')
    }

    if (message?.mentions.channels.size === 0) {
      return messageHandler.get(guild, 'NO_TAGGED_CHANNELS')
    }

    let channels

    if (message) {
      channels = Array.from(message.mentions.channels.keys())
    } else {
      // TODO: is this intended to only set a single channel?
      channels = [interaction.options.getChannel('channel', true).id]
    }

    await command.setRequiredChannels({ guildId: guild?.id, channels })

    return messageHandler.get(guild, 'NOW_CHANNEL_COMMAND', {
      COMMAND: commandName,
      CHANNELS: args.join(' '),
    })
  },
} as ICommand
