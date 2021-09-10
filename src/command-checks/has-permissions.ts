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
