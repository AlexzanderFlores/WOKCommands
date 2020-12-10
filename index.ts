import { Client, Guild } from 'discord.js'
import { Connection } from 'mongoose'
import { EventEmitter } from 'events'

import CommandHandler from './CommandHandler'
import FeatureHandler from './FeatureHandler'
import mongo, { getMongoConnection } from './mongo'
import prefixes from './models/prefixes'
import MessageHandler from './message-handler'

class WOKCommands extends EventEmitter {
  private _defaultPrefix = '!'
  private _commandsDir = 'commands'
  private _featureDir = ''
  private _mongo = ''
  private _mongoConnection: Connection | null = null
  private _displayName = ''
  private _syntaxError = ''
  private _prefixes: { [name: string]: string } = {}
  private _categories: Map<String, String> = new Map() // <Category Name, Emoji Icon>
  private _color = ''
  private _commandHandler: CommandHandler
  private _featureHandler: FeatureHandler | null = null
  private _tagPeople = true
  private _botOwner: string[] = []
  private _defaultLanguage = 'english'
  private _messageHandler: MessageHandler

  constructor(
    client: Client,
    commandsDir?: string,
    featureDir?: string,
    messagesPath?: string
  ) {
    super()

    if (!client) {
      throw new Error('No Discord JS Client provided as first argument!')
    }

    const { partials } = client.options

    if (
      !partials ||
      !partials.includes('MESSAGE') ||
      !partials.includes('REACTION')
    ) {
      console.warn(
        `WOKCommands > It is encouraged to use both "MESSAGE" and "REACTION" partials when using WOKCommands due to it's help menu. More information can be found here: https://discord.js.org/#/docs/main/stable/topics/partials`
      )
    }

    if (!commandsDir) {
      console.warn(
        'WOKCommands > No commands folder specified. Using "commands"'
      )
    }

    // Get the directory path of the project using this package
    // This way users don't need to use path.join(__dirname, 'dir')
    if (module && require.main) {
      const { path } = require.main
      if (path) {
        commandsDir = `${path}/${commandsDir || this._commandsDir}`

        if (featureDir) {
          featureDir = `${path}/${featureDir}`
        }

        if (messagesPath) {
          messagesPath = `${path}/${messagesPath}`
        }
      }
    }

    this._commandsDir = commandsDir || this._commandsDir
    this._featureDir = featureDir || this._featureDir

    this._commandHandler = new CommandHandler(this, client, this._commandsDir)
    if (this._featureDir) {
      this._featureHandler = new FeatureHandler(client, this, this._featureDir)
    }

    this._messageHandler = new MessageHandler(this, messagesPath)

    this._syntaxError = this._messageHandler.get(null, 'SYNTAX_ERROR')

    this.setCategoryEmoji('Configuration', '⚙️')
    this.setCategoryEmoji('Help', '❓')

    setTimeout(async () => {
      if (this._mongo) {
        await mongo(this._mongo, this)

        this._mongoConnection = getMongoConnection()

        const results: any[] = await prefixes.find({})

        for (const result of results) {
          const { _id, prefix } = result

          this._prefixes[_id] = prefix
        }
      } else {
        console.warn(
          'WOKCommands > No MongoDB connection URI provided. Some features might not work! See this for more details:\nhttps://github.com/AlexzanderFlores/WOKCommands#setup'
        )

        this.emit('databaseConnected', null, '')
      }
    }, 500)
  }

  public get mongoPath(): string {
    return this._mongo
  }

  public setMongoPath(mongoPath: string): WOKCommands {
    this._mongo = mongoPath
    return this
  }

  public get syntaxError(): string {
    return this._syntaxError
  }

  public getSyntaxError(guild: Guild | null): string {
    if (this.syntaxError || !guild) {
      return this.syntaxError
    }

    return this._messageHandler.get(guild, 'SYNTAX_ERROR')
  }

  /**
   * @deprecated Please use the messages.json file instead of this method.
   */
  public setSyntaxError(syntaxError: string): WOKCommands {
    console.warn(
      `WOKCommands > The setSyntaxError method is deprecated. Please use messages.json instead.`
    )
    // this._syntaxError = syntaxError
    return this
  }

  public get displayName(): string {
    return this._displayName
  }

  public setDisplayName(displayName: string): WOKCommands {
    this._displayName = displayName
    return this
  }

  public get prefixes() {
    return this._prefixes
  }

  public get defaultPrefix(): string {
    return this._defaultPrefix
  }

  public setDefaultPrefix(defaultPrefix: string): WOKCommands {
    this._defaultPrefix = defaultPrefix
    return this
  }

  public getPrefix(guild: Guild | null): string {
    return this._prefixes[guild ? guild.id : ''] || this._defaultPrefix
  }

  public setPrefix(guild: Guild | null, prefix: string): WOKCommands {
    if (guild) {
      this._prefixes[guild.id] = prefix
    }
    return this
  }

  public get categories(): Map<String, String> {
    return this._categories
  }

  public get color(): string {
    return this._color
  }

  public setColor(color: string): WOKCommands {
    this._color = color
    return this
  }

  public getEmoji(category: string): string {
    // @ts-ignore
    return this._categories.get(category) || ''
  }

  public getCategory(emoji: string): string {
    let result = ''

    this._categories.forEach((value, key) => {
      if (emoji === value) {
        // @ts-ignore
        result = key
        return false
      }
    })

    return result
  }

  public setCategoryEmoji(category: string, emoji: string): WOKCommands {
    this._categories.set(category, emoji || this.categories.get(category) || '')
    return this
  }

  public get commandHandler(): CommandHandler {
    return this._commandHandler
  }

  public get mongoConnection(): Connection | null {
    return this._mongoConnection
  }

  public isDBConnected(): boolean {
    const connection = this.mongoConnection
    return !!(connection && connection.readyState === 1)
  }

  public setTagPeople(tagPeople: boolean): WOKCommands {
    this._tagPeople = tagPeople
    return this
  }

  public get tagPeople(): boolean {
    return this._tagPeople
  }

  public get botOwner(): string[] {
    return this._botOwner
  }

  public setBotOwner(botOwner: string | string[]): WOKCommands {
    if (typeof botOwner === 'string') {
      botOwner = [botOwner]
    }
    this._botOwner = botOwner
    return this
  }

  public get defaultLanguage(): string {
    return this._defaultLanguage
  }

  public setDefaultLanguage(defaultLanguage: string): WOKCommands {
    this._defaultLanguage = defaultLanguage
    return this
  }

  public get messageHandler(): MessageHandler {
    return this._messageHandler
  }
}

export = WOKCommands
