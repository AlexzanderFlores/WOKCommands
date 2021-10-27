import { Message } from 'discord.js'

import { ICommandCheck } from '../../typings'

export = async (commandCheck: ICommandCheck) => {
  const { guild, command, instance, user, reply } = commandCheck

  const { ownerOnly } = command

  if (!ownerOnly) {
    return true
  }

  if (!instance.botOwner.includes(user.id)) {
    reply(instance.messageHandler.get(guild, 'BOT_OWNERS_ONLY')).then(
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

    return false
  }

  return true
}
