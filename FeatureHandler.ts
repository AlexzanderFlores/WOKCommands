import { Client } from 'discord.js'
import fs from 'fs'
import WOKCommands from '.'

import getAllFiles from './get-all-files'

const loadFeature = (
  func: Function,
  client: Client,
  instance: WOKCommands,
  isEnabled: Function
) => {
  func(client, instance, isEnabled)
}

class FeatureHandler {
  private _features: Map<String, String[]> = new Map() // <Feature name, Disabled GuildIDs>

  constructor(client: Client, instance: WOKCommands, dir: string) {
    if (dir) {
      if (fs.existsSync(dir)) {
        const files = getAllFiles(dir)

        const amount = files.length
        if (amount > 0) {
          console.log(
            `WOKCommands > Loaded ${amount} listener${amount === 1 ? '' : 's'}.`
          )
          ;(async () => {
            const waitingForDB: {
              func: Function
              client: Client
              instance: WOKCommands
              isEnabled: Function
            }[] = []

            for (const [file, fileName] of files) {
              const { default: func, config } = await import(file)

              if (config) {
                const { displayName, dbName } = config

                const missing = []
                if (!displayName) missing.push('displayName')
                if (!dbName) missing.push('dbName')

                if (missing.length) {
                  console.warn(
                    `WOKCommands > Feature "${fileName}" has a config file that doesn't contain the following properties: ${missing}`
                  )
                }
              } else {
                console.warn(
                  `WOKCommands > Feature "${fileName}" does not export a config object.`
                )
              }

              if (typeof func === 'function') {
                const isEnabled = (guildId: string) => {
                  return this.isEnabled(guildId, file)
                }

                if (config && config.loadDBFirst === true) {
                  waitingForDB.push({
                    func,
                    client,
                    instance,
                    isEnabled,
                  })
                  continue
                }

                loadFeature(func, client, instance, isEnabled)
              }
            }

            instance.on('databaseConnected', (connection, state) => {
              if (state === 'Connected') {
                for (const {
                  func,
                  client,
                  instance,
                  isEnabled,
                } of waitingForDB) {
                  loadFeature(func, client, instance, isEnabled)
                }
              }
            })
          })()
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
