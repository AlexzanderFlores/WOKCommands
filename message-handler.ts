import languageSchema from './models/languages'
import { Guild } from 'discord.js'
import WOKCommands from '.'

export default class MessageHandler {
  private _instance: WOKCommands
  private _guildLanguages: Map<string, string> = new Map() // <Guild ID, Language>
  private _languages: string[] = []
  private _messages: {
    [key: string]: {
      [key: string]: string
    }
  } = {}

  constructor(instance: WOKCommands, messagePath = './messages.json') {
    this._instance = instance
    ;(async () => {
      this._messages = await import(messagePath)

      for (const messageId of Object.keys(this._messages)) {
        for (const language of Object.keys(this._messages[messageId])) {
          this._languages.push(language.toLowerCase())
        }
      }

      const results = await languageSchema.find()

      // @ts-ignore
      for (const { _id: guildId, language } of results) {
        console.log(`Set "${language}" for "${guildId}"`)
        this._guildLanguages.set(guildId, language)
      }
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

    let result = this._messages[messageId][language]

    for (const key of Object.keys(args)) {
      result = result.replace(`{${key}}`, args[key])
    }

    return result
  }
}
