import { Guild, GuildMember, Message, User , GuildChannel } from 'discord.js'
import WOKCommands from '..'
import Command from '../Command'
import CommandErrors from '../enums/CommandErrors'

/**
 * Checks if the given command is enabled in the current guild
 */
export = (
  guild: Guild | null,
  command: Command,
  instance: WOKCommands,
  member: GuildMember,
  user: User,
  reply: Function,
  args: string[],
  name: string,
  channel: GuildChannel,
  message : Message
) => {
  if (!guild || !command.isDisabled(guild.id)) {
    return true
  }

  const { error } = command

  if (error) {
    error({
      error: CommandErrors.COMMAND_DISABLED,
      command,
      message,
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
