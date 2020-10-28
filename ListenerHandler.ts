import { Client } from 'discord.js'
import fs from 'fs'

class ListenerHandler {
  constructor(client: Client, dir: string) {
    if (dir) {
      if (fs.existsSync(dir)) {
        const files = fs
          .readdirSync(dir)
          .filter((file: string) => file.endsWith('.js'))

        const amount = files.length
        if (amount > 0) {
          console.log(
            `WOKCommands > Loaded ${amount} listener${amount === 1 ? '' : 's'}.`
          )

          for (const file of files) {
            const path = `${dir}/${file}`
            const func = require(path)
            if (typeof func === 'function') {
              func(client)
            }
          }
        }
      } else {
        throw new Error(`Listeners directory "${dir}" doesn't exist!`)
      }
    }
  }
}

export = ListenerHandler
