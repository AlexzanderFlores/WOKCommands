import { Guild, GuildMember, Message, User } from 'discord.js'
import WOKCommands from '..'
import Command from '../Command'
import CommandErrors from '../enums/CommandErrors'

export = (
  guild: Guild | null,
  command: Command,
  instance: WOKCommands,
  member: GuildMember,
  user: User,
  reply: Function
) => {
  const { cooldown, globalCooldown, error } = command

  if ((cooldown || globalCooldown) && user) {
    const guildId = guild ? guild.id : 'dm'

    const timeLeft = command.getCooldownSeconds(guildId, user.id)
    if (timeLeft) {
      if (error) {
        error({
          error: CommandErrors.COOLDOWN,
          command,
          message: null,
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
