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
  const { guildOnly } = command

  // If this command doesn't care if it's in a guild or not then just simply return true
  if (!guildOnly) {
    return true
  }

  if (!guild) {
    reply(instance.messageHandler.get(guild, 'GUILD_ONLY_COMMAND')).then(
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

  // The guild exists
  return true
}
