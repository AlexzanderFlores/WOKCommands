import { Client, Message } from 'discord.js'
import WOKCommands from '..'

export default interface ICommandArguments {
  message: Message
  args: string[]
  text: string
  client: Client
  prefix: string
  instance: WOKCommands
}
