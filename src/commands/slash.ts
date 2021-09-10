import { ApplicationCommand, MessageEmbed } from 'discord.js'
import { ICallbackObject, ICommand } from '../..'

export = {
  description: 'Allows the bot developers to manage existing slash commands',
  category: 'Configuration',

  permissions: ['ADMINISTRATOR'],

  maxArgs: 1,
  expectedArgs: '[command-id]',

  ownerOnly: true,
  hidden: true,

  slash: 'both',

  callback: async (options: ICallbackObject) => {
    const { channel, instance, text } = options

    const { guild } = channel
    const { slashCommands } = instance

    const global = await slashCommands.get()

    if (text) {
      let useGuild = true

      try {
        global?.forEach((cmd: ApplicationCommand) => {
          if (cmd.id === text) {
            useGuild = false
            throw new Error('')
          }
        })
      } catch (ignored) {}

      slashCommands.delete(text, useGuild ? guild.id : undefined)

      if (useGuild) {
        return `Slash command with the ID "${text}" has been deleted from guild "${guild.id}".`
      }

      return `Slash command with the ID "${text}" has been deleted. This may take up to 1 hour to be seen on all servers using your bot.`
    }

    let allSlashCommands = ''

    if (global.size) {
      global.forEach((cmd: ApplicationCommand) => {
        allSlashCommands += `${cmd.name}: ${cmd.id}\n`
      })
    } else {
      allSlashCommands = 'None'
    }

    const embed = new MessageEmbed()
      .addField(
        'How to delete a slash command:',
        `${instance.getPrefix(guild)}slash <command-id>`
      )
      .addField('List of global slash commands:', allSlashCommands)

    if (guild) {
      const guildOnly = await slashCommands.get(guild.id)

      let guildOnlyCommands = ''

      if (guildOnly.size) {
        guildOnly.forEach((cmd: ApplicationCommand) => {
          guildOnlyCommands += `${cmd.name}: ${cmd.id}\n`
        })
      } else {
        guildOnlyCommands = 'None'
      }

      embed.addField(
        'List of slash commands for this guild:',
        guildOnlyCommands
      )
    }

    if (instance.color) {
      embed.setColor(instance.color)
    }

    return embed
  },
} as ICommand
