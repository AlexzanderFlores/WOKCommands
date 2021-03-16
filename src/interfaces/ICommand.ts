import { Client, Message, PermissionString, TextChannel } from 'discord.js'
import WOKCommands from '..'

export default interface ICommand {
  names: string[] | string
  category: string
  minArgs?: number
  maxArgs?: number
  syntaxError?: { [key: string]: string }
  expectedArgs?: string
  description?: string
  syntax?: string
  requiredPermissions?: PermissionString[]
  permissions?: PermissionString[]
  callback?: {
    message: Message
    channel: TextChannel
    args: string[]
    text: string
    client: Client
    prefix: string
    instance: WOKCommands
  }
  cooldown?: string
  globalCooldown?: string
  ownerOnly?: boolean
  hidden?: boolean
  guildOnly?: boolean
  testOnly?: boolean
  slash?: boolean | 'both'
}
