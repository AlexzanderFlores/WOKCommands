import { Guild } from 'discord.js'

import languageSchema from './models/languages'
import WOKCommands from '.'
import Events from './enums/Events'
const defualtMessages = require('../messages.json')

export default class MessageHandler {
  private _instance: WOKCommands
  private _guildLanguages: Map<string, string> = new Map() // <Guild ID, Language>
  private _languages: string[] = []
  private _messages: {
    [key: string]: {
      [key: string]: any
    }
  } = {}

  constructor(instance: WOKCommands, messagePath: string) {
    this._instance = instance
    ;(async () => {
      this._messages = messagePath ? await import(messagePath) : defualtMessages

      for (const messageId of Object.keys(this._messages)) {
        for (const language of Object.keys(this._messages[messageId])) {
          this._languages.push(language.toLowerCase())
        }
      }

      if (!this._languages.includes(instance.defaultLanguage)) {
        throw new Error(
          `The current default language defined is not supported.`
        )
      }

      instance.on(
        Events.DATABASE_CONNECTED,
        async (connection: any, state: string) => {
          if (state !== 'Connected') {
            return
          }

          const results = await languageSchema.find()

          // @ts-ignore
          for (const { _id: guildId, language } of results) {
            this._guildLanguages.set(guildId, language)
          }
        }
      )
    })()
  }

  public languages(): string[] {
    return this._languages
  }

  public async setLanguage(guild: Guild | null, language: string) {
    if (guild) {
      this._guildLanguages.set(guild.id, language)
    }
  }

  public getLanguage(guild: Guild | null): string {
    if (guild) {
      const result = this._guildLanguages.get(guild.id)
      if (result) {
        return result
      }
    }
    return this._instance.defaultLanguage
  }

  get(
    guild: Guild | null,
    messageId: string,
    args: { [key: string]: string } = {}
  ): string {
    const language = this.getLanguage(guild)

    const translations = this._messages[messageId]
    if (!translations) {
      console.error(
        `WOKCommands > Could not find the correct message to send for "${messageId}"`
      )
      return 'Could not find the correct message to send. Please report this to the bot developer.'
    }

    let result = translations[language]

    for (const key of Object.keys(args)) {
      const expression = new RegExp(`{${key}}`, 'g')
      result = result.replace(expression, args[key])
    }

    return result
  }

  getEmbed(
    guild: Guild | null,
    embedId: string,
    itemId: string,
    args: { [key: string]: string } = {}
  ): string {
    const language = this.getLanguage(guild)

    const items = this._messages[embedId]
    if (!items) {
      console.error(
        `WOKCommands > Could not find the correct item to send for "${embedId}" -> "${itemId}"`
      )
      return 'Could not find the correct message to send. Please report this to the bot developer.'
    }

    const translations = items[itemId]
    if (!translations) {
      console.error(
        `WOKCommands > Could not find the correct message to send for "${embedId}"`
      )
      return 'Could not find the correct message to send. Please report this to the bot developer.'
    }

    let result = translations[language]

    for (const key of Object.keys(args)) {
      const expression = new RegExp(`{${key}}`, 'g')
      result = result.replace(expression, args[key])
    }

    return result
  }
}
