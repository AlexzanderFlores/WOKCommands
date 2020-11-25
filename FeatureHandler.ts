import { Client } from 'discord.js'
import fs from 'fs'

import getAllFiles from './get-all-files'

class FeatureHandler {
  private _features: Map<String, String[]> = new Map() // <Feature name, Disabled GuildIDs>

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
              func(client, (guildId: string) => {
                return this.isEnabled(guildId, file)
              })
            }
          }
        }
      } else {
        throw new Error(`Listeners directory "${dir}" doesn't exist!`)
      }
    }
  }

  private isEnabled = (guildId: string, feature: string): boolean => {
    return !(this._features.get(feature) || []).includes(guildId)
  }
}

export = FeatureHandler
