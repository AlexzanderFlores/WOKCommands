import { Message } from 'discord.js'

import { ICommandCheck } from '../../typings'
import CommandErrors from '../enums/CommandErrors'

export = async (commandCheck: ICommandCheck) => {
  const { guild, command, instance, message, member, reply } = commandCheck

  if (!guild || !member) {
    return true
  }

  const { error } = command

  const roles = command.getRequiredRoles(guild.id)

  if (roles && roles.length) {
    const missingRoles = []
    const missingRolesNames = []

    for (const role of roles) {
      const realRole = await guild.roles.fetch(role)

      if (realRole !== null && !member.roles.cache.has(role)) {
        missingRoles.push(role)
        missingRolesNames.push(realRole.name)
      }
    }

    if (missingRoles.length) {
      if (error) {
        error({
          error: CommandErrors.MISSING_ROLES,
          command,
          message,
          info: {
            missingRoles,
          },
        })
      } else {
        reply(
          instance.messageHandler.get(guild, 'MISSING_ROLES', {
            ROLES: missingRolesNames.join(', '),
          })
        ).then((message: Message | null) => {
          if (!message) {
            return
          }

          if (instance.delErrMsgCooldown === -1 || !message.deletable) {
            return
          }

          setTimeout(() => {
            message.delete()
          }, 1000 * instance.delErrMsgCooldown)
        })
      }

      return false
    }
  } else if (command.doesRequireRoles) {
    reply(
      instance.messageHandler.get(guild, 'REQUIRE_ROLES', {
        PREFIX: instance.getPrefix(guild),
        COMMAND: command.names[0],
      })
    ).then((message: Message | null) => {
      if (!message) {
        return
      }

      if (instance.delErrMsgCooldown === -1 || !message.deletable) {
        return
      }

      setTimeout(() => {
        message.delete()
      }, 1000 * instance.delErrMsgCooldown)
    })
    return false
  }

  return true
}
