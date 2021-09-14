import { Client, ColorResolvable, Guild, GuildEmoji } from 'discord.js'
import { Connection } from 'mongoose'
import { EventEmitter } from 'events'

import FeatureHandler from './FeatureHandler'
import mongo, { getMongoConnection } from './mongo'
import prefixes from './models/prefixes'
import MessageHandler from './message-handler'
import SlashCommands from './SlashCommands'
import { ICategorySetting, Options } from '..'
import Events from './enums/Events'
import CommandHandler from './CommandHandler'

export default class WOKCommands extends EventEmitter {
  private _client: Client
  private _defaultPrefix = '!'
  private _commandsDir = 'commands'
  private _featuresDir = ''
  private _mongoConnection: Connection | null = null
  private _displayName = ''
  private _prefixes: { [name: string]: string } = {}
  private _categories: Map<String, String | GuildEmoji> = new Map() // <Category Name, Emoji Icon>
  private _hiddenCategories: string[] = []
  private _color: ColorResolvable | null = null
  private _commandHandler: CommandHandler | null = null
  private _featureHandler: FeatureHandler | null = null
  private _tagPeople = true
  private _showWarns = true
  private _delErrMsgCooldown = -1
  private _ignoreBots = true
  private _botOwner: string[] = []
  private _testServers: string[] = []
  private _defaultLanguage = 'english'
  private _ephemeral = true
  private _messageHandler: MessageHandler | null = null
  private _slashCommand: SlashCommands | null = null

  constructor(client: Client, options?: Options) {
    super()

    this._client = client

    this.setUp(client, options)
  }

  private async setUp(client: Client, options?: Options) {
    if (!client) {
      throw new Error('No Discord JS Client provided as first argument!')
    }

    let {
      commandsDir = '',
      commandDir = '',
      featuresDir = '',
      featureDir = '',
      messagesPath,
      mongoUri,
      showWarns = true,
      delErrMsgCooldown = -1,
      defaultLanguage = 'english',
      ignoreBots = true,
      dbOptions,
      testServers,
      disabledDefaultCommands = [],
      typeScript = false,
      ephemeral = true,
    } = options || {}

    if (mongoUri) {
      await mongo(mongoUri, this, dbOptions)

      this._mongoConnection = getMongoConnection()

      const results: any[] = await prefixes.find({})

      for (const result of results) {
        const { _id, prefix } = result

        this._prefixes[_id] = prefix
      }
    } else {
      if (showWarns) {
        console.warn(
          'WOKCommands > No MongoDB connection URI provided. Some features might not work! See this for more details:\nhttps://docs.wornoffkeys.com/databases/mongodb'
        )
      }

      this.emit(Events.DATABASE_CONNECTED, null, '')
    }

    this._commandsDir = commandsDir || commandDir || this._commandsDir
    this._featuresDir = featuresDir || featureDir || this._featuresDir
    this._ephemeral = ephemeral

    if (
      this._commandsDir &&
      !(this._commandsDir.includes('/') || this._commandsDir.includes('\\'))
    ) {
      throw new Error(
        "WOKCommands > The 'commands' directory must be an absolute path. This can be done by using the 'path' module. More info: https://docs.wornoffkeys.com/setup-and-options-object"
      )
    }

    if (
      this._featuresDir &&
      !(this._featuresDir.includes('/') || this._featuresDir.includes('\\'))
    ) {
      throw new Error(
        "WOKCommands > The 'features' directory must be an absolute path. This can be done by using the 'path' module. More info: https://docs.wornoffkeys.com/setup-and-options-object"
      )
    }

    if (testServers) {
      if (typeof testServers === 'string') {
        testServers = [testServers]
      }

      this._testServers = testServers
    }

    this._showWarns = showWarns
    this._delErrMsgCooldown = delErrMsgCooldown
    this._defaultLanguage = defaultLanguage.toLowerCase()
    this._ignoreBots = ignoreBots

    if (typeof disabledDefaultCommands === 'string') {
      disabledDefaultCommands = [disabledDefaultCommands]
    }

    this._slashCommand = new SlashCommands(this)

    this._commandHandler = new CommandHandler(
      this,
      client,
      this._commandsDir,
      disabledDefaultCommands,
      typeScript
    )
    this._featureHandler = new FeatureHandler(
      client,
      this,
      this._featuresDir,
      typeScript
    )
    this._messageHandler = new MessageHandler(this, messagesPath || '')

    this.setCategorySettings([
      {
        name: 'Configuration',
        emoji: '⚙',
      },
      {
        name: 'Help',
        emoji: '❓',
      },
    ])
  }

  public setMongoPath(mongoPath: string | undefined): WOKCommands {
    console.warn(
      'WOKCommands > .setMongoPath() no longer works as expected. Please pass in your mongo URI as a "mongoUri" property using the options object. For more information: https://docs.wornoffkeys.com/databases/mongodb'
    )
    return this
  }

  public get client(): Client {
    return this._client
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

  public get categories(): Map<String, String | GuildEmoji> {
    return this._categories
  }

  public get hiddenCategories(): string[] {
    return this._hiddenCategories
  }

  public get color(): ColorResolvable | null {
    return this._color
  }

  public setColor(color: ColorResolvable | null): WOKCommands {
    this._color = color
    return this
  }

  public getEmoji(category: string): string {
    const emoji = this._categories.get(category) || ''
    if (typeof emoji === 'object') {
      // @ts-ignore
      return `<:${emoji.name}:${emoji.id}>`
    }

    return emoji
  }

  public getCategory(emoji: string | null): string {
    let result = ''

    this._categories.forEach((value, key) => {
      // == is intended here
      if (emoji == value) {
        // @ts-ignore
        result = key
        return false
      }
    })

    return result
  }

  public setCategorySettings(category: ICategorySetting[]): WOKCommands {
    for (let { emoji, name, hidden, customEmoji } of category) {
      if (emoji.startsWith('<:') && emoji.endsWith('>')) {
        customEmoji = true
        emoji = emoji.split(':')[2]
        emoji = emoji.substring(0, emoji.length - 1)
      }

      let targetEmoji: string | GuildEmoji | undefined = emoji

      if (customEmoji) {
        targetEmoji = this._client.emojis.cache.get(emoji)
      }

      if (this.isEmojiUsed(targetEmoji)) {
        console.warn(
          `WOKCommands > The emoji "${targetEmoji}" for category "${name}" is already used.`
        )
      }

      this._categories.set(name, targetEmoji || this.categories.get(name) || '')

      if (hidden) {
        this._hiddenCategories.push(name)
      }
    }

    return this
  }

  private isEmojiUsed(emoji: string | GuildEmoji | undefined): boolean {
    if (!emoji) {
      return false
    }

    let isUsed = false

    this._categories.forEach((value) => {
      if (value === emoji) {
        isUsed = true
      }
    })

    return isUsed
  }

  public get commandHandler(): CommandHandler {
    return this._commandHandler!
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

  public get delErrMsgCooldown(): number {
    return this._delErrMsgCooldown
  }

  public get ignoreBots(): boolean {
    return this._ignoreBots
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

  public get ephemeral(): boolean {
    return this._ephemeral
  }

  public get messageHandler(): MessageHandler {
    return this._messageHandler!
  }

  public get slashCommands(): SlashCommands {
    return this._slashCommand!
  }
}

module.exports = WOKCommands
