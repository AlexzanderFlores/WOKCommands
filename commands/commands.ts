import { Client, Message } from 'discord.js'
import WOKCommands from '..'

export = {
  maxArgs: 0,
  description: 'Lists all commands for this bot',
  callback: (
    message: Message,
    args: string[],
    text: string,
    prefix: string,
    client: Client,
    instance: WOKCommands
  ) => {
    let msg = 'Commands:\n'

    for (const command of instance.commands) {
      const { names, description } = command

      msg += `
**${names.shift()}**
Aliases: ${names.length ? `"${names.join('", "')}"` : 'None'}
Description: ${description || 'None'}
`
    }

    message.channel.send(msg)
  },
}
