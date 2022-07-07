import { Message } from 'discord.js'

import { ICommandCheck } from '../../typings'
import CommandErrors from '../enums/CommandErrors'

export = async (commandCheck: ICommandCheck) => {
  const { guild, command, instance, message, reply } = commandCheck

  if (!guild || !command.isDisabled(guild.id)) {
    return true
  }

  const { error } = command

  if (error) {
    error({
      error: CommandErrors.COMMAND_DISABLED,
      message,
      command,
    })
  } else {
    reply(instance.messageHandler.get(guild, 'DISABLED_COMMAND')).then(
      (message: Message | null) => {
        if (!message) {
          return
        }

        if (instance.delErrMsgCooldown === -1 || !message.deletable) {
          return
        }

        setTimeout(() => {
          message.delete()
        }, 1000 * instance.delErrMsgCooldown)
      }
    )
  }

  return false
}
