import ICommandArguments from '../interfaces/ICommandArguments'
import requiredRoleSchema from '../models/required-roles'

export = {
  aliases: ['requiredroles', 'requirerole', 'requireroles'],
  minArgs: 2,
  maxArgs: 2,
  cooldown: '2s',
  expectedArgs: '<Command Name> <"none" | Tagged Role | Role ID String>',
  requiredPermissions: ['ADMINISTRATOR'],
  description: 'Specifies what role each command requires.',
  category: 'Configuration',
  callback: async (options: ICommandArguments) => {
    const { message, args, instance } = options

    const name = (args.shift() || '').toLowerCase()
    let roleId =
      message.mentions.roles.first() || (args.shift() || '').toLowerCase()

    if (typeof roleId !== 'string') {
      roleId = roleId.id
    }

    const { guild } = message
    if (!guild) {
      message.reply(
        instance.messageHandler.get(
          guild,
          'CANNOT_CHANGE_REQUIRED_ROLES_IN_DMS'
        )
      )
      return
    }

    if (!instance.isDBConnected()) {
      message.reply(instance.messageHandler.get(guild, 'NO_DATABASE_FOUND'))
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
          instance.messageHandler.get(guild, 'REMOVED_ALL_REQUIRED_ROLES', {
            COMMAND: command.names[0],
          })
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

        message.reply(
          instance.messageHandler.get(guild, 'ADDED_REQUIRED_ROLE', {
            ROLE: roleId,
            COMMAND: command.names[0],
          })
        )
      }
    } else {
      message.reply(
        instance.messageHandler.get(guild, 'UNKNOWN_COMMAND', {
          COMMAND: name,
        })
      )
    }
  },
}
