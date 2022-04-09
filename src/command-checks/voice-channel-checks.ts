import { Guild, GuildMember, Message, User } from 'discord.js'
import WOKCommands from '..'
import Command from '../Command'

export = (
  guild: Guild | null,
  command: Command,
  instance: WOKCommands,
  member: GuildMember,
  user: User,
  reply: Function
) => {
  const { voiceOnly } = command

  if (!voiceOnly) {
    return true
  }

  if (!(member instanceof GuildMember) || !member.voice.channel) {
    reply(instance.messageHandler.get(guild, 'VOICE_CHANNEL_ONLY')).then(
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
