import { Client, Message } from 'discord.js'
import WOKCommands from '..'
import requiredRoleSchema from '../models/required-roles'

export = {
  aliases: ['requiredroles', 'requirerole', 'requireroles'],
  minArgs: 2,
  maxArgs: 2,
  expectedArgs: '<Command Name> <"none" | Tagged Role | Role ID String>',
  requiredPermissions: ['ADMINISTRATOR'],
  description: 'Specifies what role each command requires.',
  callback: async (
    message: Message,
    args: string[],
    text: string,
    prefix: string,
    client: Client,
    instance: WOKCommands
  ) => {
    const name = (args.shift() || '').toLowerCase()
    let roleId =
      message.mentions.roles.first() || (args.shift() || '').toLowerCase()

    if (typeof roleId !== 'string') {
      roleId = roleId.id
    }

    const { guild } = message
    if (!guild) {
      message.reply('You cannot change required roles in private messages')
      return
    }

    const command = instance.commandHandler.getCommand(name)

    if (command) {
      if (roleId === 'none') {
        command.removeRequiredRole(guild.id, roleId)

        await requiredRoleSchema.deleteOne({
          guildId: guild.id,
          command: command.names[0],
        })

        message.reply(
          `Removed all required roles from command "${command.names[0]}"`
        )
      } else {
        command.addRequiredRole(guild.id, roleId)

        await requiredRoleSchema.findOneAndUpdate(
          {
            guildId: guild.id,
            command: command.names[0],
          },
          {
            guildId: guild.id,
            command: command.names[0],
            $addToSet: {
              requiredRoles: roleId,
            },
          },
          {
            upsert: true,
          }
        )

        message.reply(`Added role "${roleId}" to command "${command.names[0]}"`)
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
