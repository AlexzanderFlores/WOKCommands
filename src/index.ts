import { Client, Guild } from 'discord.js'
import { Connection } from 'mongoose'
import { EventEmitter } from 'events'

import CommandHandler from './CommandHandler'
import FeatureHandler from './FeatureHandler'
import mongo, { getMongoConnection } from './mongo'
import prefixes from './models/prefixes'
import MessageHandler from './message-handler'

type Options = {
  commandsDir?: string
  featureDir?: string
  messagesPath?: string
  showWarns?: boolean
  dbOptions?: {}
  testServers?: string | string[]
}

class WOKCommands extends EventEmitter {
  private _defaultPrefix = '!'
  private _commandsDir = 'commands'
  private _featureDir = ''
  private _mongo = ''
  private _mongoConnection: Connection | null = null
  private _displayName = ''
  private _prefixes: { [name: string]: string } = {}
  private _categories: Map<String, String> = new Map() // <Category Name, Emoji Icon>
  private _hiddenCategories: string[] = []
  private _color = ''
  private _commandHandler: CommandHandler
  private _featureHandler: FeatureHandler | null = null
  private _tagPeople = true
  private _showWarns = true
  private _botOwner: string[] = []
  private _testServers: string[] = []
  private _defaultLanguage = 'english'
  private _messageHandler: MessageHandler

  constructor(client: Client, options: Options) {
    super()

    if (!client) {
      throw new Error('No Discord JS Client provided as first argument!')
    }

    let {
      commandsDir = '',
      featureDir = '',
      messagesPath,
      showWarns = true,
      dbOptions,
      testServers,
    } = options

    const { partials } = client.options

    if (
      !partials ||
      !partials.includes('MESSAGE') ||
      !partials.includes('REACTION')
    ) {
      if (showWarns) {
        console.warn(
          `WOKCommands > It is encouraged to use both "MESSAGE" and "REACTION" partials when using WOKCommands due to it's help menu. More information can be found here: https://discord.js.org/#/docs/main/stable/topics/partials`
        )
      }
    }

    if (showWarns && !commandsDir) {
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

    if (testServers) {
      if (typeof testServers === 'string') {
        testServers = [testServers]
      }

      this._testServers = testServers
    }

    this._showWarns = showWarns
    this._commandsDir = commandsDir || this._commandsDir
    this._featureDir = featureDir || this._featureDir

    this._commandHandler = new CommandHandler(this, client, this._commandsDir)
    if (this._featureDir) {
      this._featureHandler = new FeatureHandler(client, this, this._featureDir)
    }

    this._messageHandler = new MessageHandler(this, messagesPath || '')

    this.setCategorySettings('Configuration', '⚙️')
    this.setCategorySettings('Help', '❓')

    setTimeout(async () => {
      if (this._mongo) {
        await mongo(this._mongo, this, dbOptions)

        this._mongoConnection = getMongoConnection()

        const results: any[] = await prefixes.find({})

        for (const result of results) {
          const { _id, prefix } = result

          this._prefixes[_id] = prefix
        }
      } else {
        if (showWarns) {
          console.warn(
            'WOKCommands > No MongoDB connection URI provided. Some features might not work! See this for more details:\nhttps://github.com/AlexzanderFlores/WOKCommands#setup'
          )
        }

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

  /**
   * @deprecated Please use the messages.json file instead of this method.
   */
  public setSyntaxError(syntaxError: string): WOKCommands {
    console.warn(
      `WOKCommands > The setSyntaxError method is deprecated. Please use messages.json instead. See https://www.npmjs.com/package/wokcommands#language-support for more information`
    )
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

  public get hiddenCategories(): string[] {
    return this._hiddenCategories
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

  /**
   * @deprecated Please use the setCategorySettings instead of this method.
   */
  public setCategoryEmoji(
    category: string | [{ [key: string]: any }],
    emoji?: string
  ): WOKCommands {
    console.warn(
      `WOKCommands > The setCategoryEmoji method is deprecated, please use setCategorySettings`
    )

    this.setCategorySettings(category, emoji)
    return this
  }

  public setCategorySettings(
    category: string | [{ [key: string]: any }],
    emoji?: string
  ): WOKCommands {
    if (typeof category == 'string') {
      if (!emoji) {
        throw new Error(
          `WOKCommands > An emoji is required for category "${category}"`
        )
      }

      if (this.isEmojiUsed(emoji)) {
        console.warn(
          `WOKCommands > The emoji "${emoji}" for category "${category}" is already used.`
        )
      }

      this._categories.set(
        category,
        emoji || this.categories.get(category) || ''
      )
    } else {
      for (const cat of category) {
        if (this.isEmojiUsed(cat.emoji)) {
          console.warn(
            `WOKCommands > The emoji "${cat.emoji}" for category "${cat.name}" is already used.`
          )
        }

        this._categories.set(
          cat.name,
          cat.emoji || this.categories.get(cat.name) || ''
        )

        if (cat.hidden) {
          this._hiddenCategories.push(cat.name)
        }
      }
    }

    return this
  }

  private isEmojiUsed(emoji: string): boolean {
    let isUsed = false

    this._categories.forEach((value) => {
      if (value === emoji) {
        isUsed = true
      }
    })

    return isUsed
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

  public get showWarns(): boolean {
    return this._showWarns
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

  public get testServers(): string[] {
    return this._testServers
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
