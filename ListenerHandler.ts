import { Client } from 'discord.js'
import fs from 'fs'

import getAllFiles from './get-all-files'

class ListenerHandler {
  constructor(client: Client, dir: string) {
    if (dir) {
      if (fs.existsSync(dir)) {
        const files = getAllFiles(dir)

        const amount = files.length
        if (amount > 0) {
          console.log(
            `WOKCommands > Loaded ${amount} listener${amount === 1 ? '' : 's'}.`
          )

          for (const [file, fileName] of files) {
            const func = require(file)

            const { feature } = func
            if (!feature) {
              throw new Error(
                `\n\nFeature "${fileName}" does not export a "feature" object. See\n\nhttps://github.com/AlexzanderFlores/WOKCommands#creating-a-feature\n\nfor more information.\n\n`
              )
            }

            const { name, canDisable, notFeature } = feature

            if (notFeature === true) {
              continue
            }

            if (name === undefined || canDisable === undefined) {
              throw new Error(
                `\n\nFeature "${fileName}" is missing "name" and/or "canDisable" properties without "notFeature" being set to true. See\n\nhttps://github.com/AlexzanderFlores/WOKCommands#creating-a-feature\n\nfor more information.\n\n`
              )
            }

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
