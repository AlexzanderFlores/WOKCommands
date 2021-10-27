import { Message } from 'discord.js'

import { ICommandCheck } from '../../typings'
import CommandErrors from '../enums/CommandErrors'

export = (commandCheck: ICommandCheck) => {
  const { guild, command, instance, member, message, reply } = commandCheck

  if (!guild || !member) {
    return true
  }

  const { requiredPermissions, error } = command

  for (const perm of requiredPermissions || []) {
    // @ts-ignore
    if (!member.permissions.has(perm)) {
      if (error) {
        error({
          error: CommandErrors.MISSING_PERMISSIONS,
          message,
          command,
        })
      } else {
        reply(
          instance.messageHandler.get(guild, 'MISSING_PERMISSION', {
            PERM: perm,
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
  }

  return true
}
