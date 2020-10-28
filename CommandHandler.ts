import { Client, Guild } from 'discord.js'
import fs from 'fs'
import WOKCommands from '.'
import Command from './Command'

class CommandHandler {
  private _commands: Map<String, Command> = new Map()

  constructor(instance: WOKCommands, client: Client, dir: string) {
    if (dir) {
      if (fs.existsSync(dir)) {
        const files = fs
          .readdirSync(dir)
          .filter((file: string) => file.endsWith('.js'))

        const amount = files.length
        if (amount > 0) {
          console.log(
            `WOKCommands > Loaded ${amount} command${amount === 1 ? '' : 's'}.`
          )

          for (const file of files) {
            const configuration = require(`${dir}/${file}`)
            const { aliases, callback } = configuration

            if (aliases && aliases.length && callback) {
              const command = new Command(instance, client, configuration)
              for (const alias of aliases) {
                // Ensure the alias is lower case because we read as lower case later on
                this._commands.set(alias.toLowerCase(), command)
              }
            }
          }

          client.on('message', (message) => {
            const guild: Guild | null = message.guild
            let content: string = message.content
            const prefix = instance.getPrefix(guild)

            if (content.startsWith(prefix)) {
              // Remove the prefix
              content = content.substring(prefix.length)

              // Get each word as an element of an array
              const words = content.split(/ /g)

              // Remove the "command", leaving just the arguments
              const firstElement = words.shift()

              if (firstElement) {
                // Ensure the user input is lower case because it is stored as lower case in the map
                const alias = firstElement.toLowerCase()

                const command = this._commands.get(alias)
                if (command) {
                  command.execute(message, words)
                }
              }
            }
          })
        }
      } else {
        throw new Error(`Commands directory "${dir}" doesn't exist!`)
      }
    }
  }
}

export = CommandHandler
