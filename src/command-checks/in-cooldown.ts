import { Message } from 'discord.js'

import { ICommandCheck } from '../../typings'
import CommandErrors from '../enums/CommandErrors'

export = async (commandCheck: ICommandCheck) => {
  const { guild, command, instance, message, user, reply } = commandCheck

  const { cooldown, globalCooldown, error } = command

  if ((cooldown || globalCooldown) && user) {
    const guildId = guild ? guild.id : 'dm'

    const timeLeft = command.getCooldownSeconds(guildId, user.id)
    if (timeLeft) {
      if (error) {
        error({
          error: CommandErrors.COOLDOWN,
          command,
          message,
          info: {
            timeLeft,
          },
        })
      } else {
        reply(
          instance.messageHandler.get(guild, 'COOLDOWN', {
            COOLDOWN: timeLeft,
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

    command.setCooldown(guildId, user.id)
  }

  return true
}
