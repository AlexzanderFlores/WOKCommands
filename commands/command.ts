import { Client, Message } from 'discord.js'
import WOKCommands from '..'
import disabledCommands from '../models/disabled-commands'

export = {
  minArgs: 2,
  maxArgs: 2,
  expectedArgs: '<"enable" or "disable"> <Command Name>',
  requiredPermissions: ['ADMINISTRATOR'],
  description: 'Enables or disables a command for this guild',
  category: 'Configuration',
  callback: async (
    message: Message,
    args: string[],
    text: string,
    client: Client,
    prefix: string,
    instance: WOKCommands
  ) => {
    const newState = args.shift()?.toLowerCase()
    const name = (args.shift() || '').toLowerCase()

    if (newState !== 'enable' && newState !== 'disable') {
      message.reply('The state must be either "enable" or "disable"')
      return
    }

    const { guild } = message
    if (!guild) {
      message.reply('You cannot enable or disable commands in private messages')
      return
    }

    const command = instance.commandHandler.getCommand(name)

    if (command) {
      const mainCommand = command.names[0]
      const isDisabled = command.isDisabled(guild.id)

      if (newState === 'enable') {
        if (!isDisabled) {
          message.reply('That command is already enabled!')
          return
        }

        await disabledCommands.deleteOne({
          guildId: guild.id,
          command: mainCommand,
        })

        command.enable(guild.id)

        message.reply(`"${mainCommand}" is now enabled!`)
      } else {
        if (isDisabled) {
          message.reply('That command is already disabled!')
          return
        }

        await new disabledCommands({
          guildId: guild.id,
          command: mainCommand,
        }).save()

        command.disable(guild.id)

        message.reply(`"${mainCommand}" is now disabled!`)
      }
    } else {
      message.reply(
        `Could not find command "${name}"! View all commands with "${instance.getPrefix(
          guild
        )}commands"`
      )
    }
  },
}
