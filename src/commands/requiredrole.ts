import { ICallbackObject, ICommand } from '../types'


export = {
  description: 'Specifies what role each command requires. Note `all` may only be used with the remove operation.',
  category: 'Configuration',

  permissions: ['ADMINISTRATOR'],
  aliases: ['requiredroles', 'requirerole', 'requireroles'],

  minArgs: 2,
  maxArgs: 3,
  expectedArgs: '<command> <add-or-remove> <all-or-roleid>',

  cooldown: '2s',

  slash: 'both',

  callback: async (options: ICallbackObject) => {
    const { channel, args, instance } = options

    const name = args.shift()?.toLowerCase()
    const operation = args.shift()?.toLowerCase()
    const roleId = args.shift()?.toLowerCase()

    const { guild } = channel
    if (!guild) {
      return instance.messageHandler.get(
        guild,
        'CANNOT_CHANGE_REQUIRED_ROLES_IN_DMS'
      )
    }

    if (!operation || !name) {
      return instance.messageHandler.get(
        guild,
        'SYNTAX_ERROR'
      )
    }

    if (!instance.isDBConnected()) {
      return instance.messageHandler.get(guild, 'NO_DATABASE_FOUND')
    }

    const command = instance.commandHandler.getCommand(name)

    if (command) {
      if (operation === 'remove') {
        await command.removeRequiredRole(guild.id, roleId || 'all')

        return instance.messageHandler.get(
          guild,
          'REMOVED_ALL_REQUIRED_ROLES',
          {
            COMMAND: command.defaultName,
          }
        )
      }

      if (!roleId || roleId === 'all') {
        return instance.messageHandler.get(
          guild,
          'SYNTAX_ERROR'
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
