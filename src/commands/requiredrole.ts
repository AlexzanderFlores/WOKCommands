import { ICallbackObject, ICommand } from '../..'


export = {
  description: 'Specifies what role each command requires.',
  category: 'Configuration',

  permissions: ['ADMINISTRATOR'],
  aliases: ['requiredroles', 'requirerole', 'requireroles'],

  minArgs: 2,
  maxArgs: 2,
  expectedArgs: '<command> <add-or-remove> <none-or-roleid>',

  cooldown: '2s',

  slash: 'both',

  callback: async (options: ICallbackObject) => {
    const { channel, args, instance } = options

    const name = (args.shift() || '').toLowerCase()
    const operation = (args.shift() || '').toLowerCase()
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
      if (operation === 'remove') {
        await command.removeRequiredRole(guild.id, roleId)

        return instance.messageHandler.get(
          guild,
          'REMOVED_ALL_REQUIRED_ROLES',
          {
            COMMAND: command.defaultName,
          }
        )
      }

      await command.addRequiredRole(guild.id, roleId)

      return instance.messageHandler.get(guild, 'ADDED_REQUIRED_ROLE', {
        ROLE: roleId,
        COMMAND: command.defaultName,
      })
    }

    return instance.messageHandler.get(guild, 'UNKNOWN_COMMAND', {
      COMMAND: name,
    })
  },
} as ICommand
