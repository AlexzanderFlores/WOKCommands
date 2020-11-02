import { Client, Message } from 'discord.js'
import WOKCommands from '..'

export = {
  maxArgs: 0,
  description: 'Lists all commands for this bot',
  callback: (
    message: Message,
    args: string[],
    text: string,
    client: Client,
    prefix: string,
    instance: WOKCommands
  ) => {
    let msg = 'Commands:\n'

    for (const command of instance.commandHandler.commands) {
      const { names, description } = command
      const mainName = names.shift() || ''

      msg += `
**${mainName}**
Aliases: ${names.length ? `"${names.join('", "')}"` : 'None'}
Description: ${description || 'None'}
Enabled: ${
        message.guild
          ? instance.commandHandler
              .getCommand(mainName)
              ?.isDisabled(message.guild.id)
            ? 'No'
            : 'Yes'
          : ''
      }
`
    }

    message.channel.send(msg)
  },
}
