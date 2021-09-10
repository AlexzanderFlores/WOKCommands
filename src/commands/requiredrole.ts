import DiscordJS from 'discord.js'
import { ICallbackObject, ICommand } from '../..'
import requiredRoleSchema from '../models/required-roles'

export = {
  description: 'Specifies what role each command requires.',
  category: 'Configuration',

  permissions: ['ADMINISTRATOR'],
  names: ['requiredroles', 'requirerole', 'requireroles'],

  minArgs: 2,
  maxArgs: 2,
  expectedArgs: '<command> <none-or-roleid>',

  cooldown: '2s',

  slash: 'both',

  callback: async (options: ICallbackObject) => {
    const { channel, args, instance } = options

    const name = (args.shift() || '').toLowerCase()
    const roleId = (args.shift() || '').toLowerCase()

    const { guild } = channel
    if (!guild) {
      return instance.messageHandler.get(
        guild,
        'CANNOT_CHANGE_REQUIRED_ROLES_IN_DMS'
      )
    }

    if (!instance.isDBConnected()) {
      return instance.messageHandler.get(guild, 'NO_DATABASE_FOUND')
    }

    const command = instance.commandHandler.getCommand(name)

    if (command) {
      if (roleId === 'none') {
        command.removeRequiredRole(guild.id, roleId)

        await requiredRoleSchema.deleteOne({
          guildId: guild.id,
          command: command.names[0],
        })

        return instance.messageHandler.get(
          guild,
          'REMOVED_ALL_REQUIRED_ROLES',
          {
            COMMAND: command.names[0],
          }
        )
      }

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

      return instance.messageHandler.get(guild, 'ADDED_REQUIRED_ROLE', {
        ROLE: roleId,
        COMMAND: command.names[0],
      })
    }

    return instance.messageHandler.get(guild, 'UNKNOWN_COMMAND', {
      COMMAND: name,
    })
  },
} as ICommand
