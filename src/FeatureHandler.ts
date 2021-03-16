import { Client } from 'discord.js'
import fs from 'fs'
import WOKCommands from '.'
import path from 'path'

import Events from './enums/Events'
import getAllFiles from './get-all-files'

const waitingForDB: {
  func: Function
  client: Client
  instance: WOKCommands
  isEnabled: Function
}[] = []

class FeatureHandler {
  private _features: Map<String, String[]> = new Map() // <Feature name, Disabled GuildIDs>
  private _client: Client
  private _instance: WOKCommands

  constructor(client: Client, instance: WOKCommands, dir: string) {
    this._client = client
    this._instance = instance
    ;(async () => {
      // Register built in features
      for (const [file, fileName] of getAllFiles(
        path.join(__dirname, 'features')
      )) {
        this.registerFeature(await import(file), fileName)
      }
    })()

    if (!dir) {
      return
    }

    if (!fs.existsSync(dir)) {
      throw new Error(`Listeners directory "${dir}" doesn't exist!`)
    }

    const files = getAllFiles(dir)

    const amount = files.length
    if (amount === 0) {
      return
    }

    console.log(
      `WOKCommands > Loaded ${amount} listener${amount === 1 ? '' : 's'}.`
    )
    ;(async () => {
      for (const [file, fileName] of files) {
        this.registerFeature(await import(file), fileName)
      }

      instance.on(Events.DATABASE_CONNECTED, (connection, state) => {
        if (state === 'Connected') {
          for (const { func, client, instance, isEnabled } of waitingForDB) {
            func(client, instance, isEnabled)
          }
        }
      })
    })()
  }

  private registerFeature = (file: any, fileName: string) => {
    const { default: func, config } = file
    let testOnly = false

    if (config) {
      const { displayName, dbName } = config
      if (config.testOnly) {
        testOnly = true
      }

      const missing = []
      if (!displayName) missing.push('displayName')
      if (!dbName) missing.push('dbName')

      if (missing.length && this._instance.showWarns) {
        console.warn(
          `WOKCommands > Feature "${fileName}" has a config file that doesn't contain the following properties: ${missing}`
        )
      }
    } else if (this._instance.showWarns) {
      console.warn(
        `WOKCommands > Feature "${fileName}" does not export a config object.`
      )
    }

    if (typeof func !== 'function') {
      return
    }

    const isEnabled = (guildId: string) => {
      if (testOnly && !this._instance.testServers.includes(guildId)) {
        return false
      }

      return this.isEnabled(guildId, file)
    }

    if (config && config.loadDBFirst === true) {
      waitingForDB.push({
        func,
        client: this._client,
        instance: this._instance,
        isEnabled,
      })
      return
    }

    func(this._client, this._instance, isEnabled)
  }

  private isEnabled = (guildId: string, feature: string): boolean => {
    return !(this._features.get(feature) || []).includes(guildId)
  }
}

export = FeatureHandler
