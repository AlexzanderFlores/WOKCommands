import { Client } from 'discord.js'
import fs from 'fs'

import getAllFiles from './get-all-files'

class FeatureHandler {
  constructor(client: Client, dir: string) {
    if (dir) {
      if (fs.existsSync(dir)) {
        const files = getAllFiles(dir)

        const amount = files.length
        if (amount > 0) {
          console.log(
            `WOKCommands > Loaded ${amount} listener${amount === 1 ? '' : 's'}.`
          )

          for (const [file] of files) {
            const func = require(file)

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

export = FeatureHandler
