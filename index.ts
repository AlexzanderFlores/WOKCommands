import { Client, Guild, MessageEmbed } from 'discord.js'
import path from 'path'
import { Connection } from 'mongoose'

import CommandHandler from './CommandHandler'
import FeatureHandler from './FeatureHandler'
import mongo, { getMongoConnection } from './mongo'
import prefixes from './models/prefixes'
import getAllFiles from './get-all-files'

class WOKCommands {
  private _defaultPrefix = '!'
  private _commandsDir = 'commands'
  private _featureDir = ''
  private _mongo = ''
  private _mongoConnection: Connection | null = null
  private _displayName = ''
  private _syntaxError = 'Incorrect usage!'
  private _prefixes: { [name: string]: string } = {}
  private _categories: Map<String, String> = new Map() // <Category Name, Emoji Icon>
  private _color = ''
  private _commandHandler: CommandHandler
  private _featureHandler: FeatureHandler | null = null
  private _tagPeople = true

  constructor(client: Client, commandsDir?: string, featureDir?: string) {
    if (!client) {
      throw new Error('No Discord JS Client provided as first argument!')
    }

    if (!commandsDir) {
      console.warn(
        'WOKCommands > No commands folder specified. Using "commands"'
      )
    }

    // Get the directory path of the project using this package
    // This way users don't need to use path.join(__dirname, 'dir')
    if (module && module.parent) {
      // @ts-ignore
      const { path } = module.parent
      if (path) {
        commandsDir = `${path}/${commandsDir || this._commandsDir}`
        if (featureDir) {
          featureDir = `${path}/${featureDir}`
        }
      }
    }

    this._commandsDir = commandsDir || this._commandsDir
    this._featureDir = featureDir || this._featureDir

    this._commandHandler = new CommandHandler(this, client, this._commandsDir)
    if (this._featureDir) {
      this._featureHandler = new FeatureHandler(client, this._featureDir)
    }

    this.setCategoryEmoji('Configuration', '⚙️')
    this.setCategoryEmoji('Help', '❓')

    setTimeout(async () => {
      if (this._mongo) {
        await mongo(this._mongo)

        this._mongoConnection = getMongoConnection()
      } else {
        console.warn(
          'WOKCommands > No MongoDB connection URI provided. Some features might not work! See this for more details:\nhttps://github.com/AlexzanderFlores/WOKCommands#setup'
        )
      }
    }, 500)

    // Register built in commands
    for (const [file, fileName] of getAllFiles(
      path.join(__dirname, 'commands')
    )) {
      this._commandHandler.registerCommand(this, client, file, fileName)
    }

    // Load prefixes from Mongo
    const loadPrefixes = async () => {
      const results: any[] = await prefixes.find({})

      for (const result of results) {
        const { _id, prefix } = result

        this._prefixes[_id] = prefix
      }
    }
    loadPrefixes()
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

  public get displayName(): string {
    return this._displayName
  }

  public setDisplayName(displayName: string): WOKCommands {
    this._displayName = displayName
    return this
  }

  public setSyntaxError(syntaxError: string): WOKCommands {
    this._syntaxError = syntaxError
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

  public setPrefix(guild: Guild | null, prefix: string) {
    if (guild) {
      this._prefixes[guild.id] = prefix
    }
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

  public setCategoryEmoji(category: string, emoji: string) {
    this._categories.set(category, emoji || this.categories.get(category) || '')
  }

  public get commandHandler(): CommandHandler {
    return this._commandHandler
  }

  public get mongoConnection(): Connection | null {
    return this._mongoConnection
  }

  public setTagPeople(tagPeople: boolean) {
    this._tagPeople = tagPeople
  }

  public get tagPeople() {
    return this._tagPeople
  }

  public updateCache = (client: Client) => {
    // @ts-ignore
    for (const [id, guild] of client.guilds.cache) {
      for (const [id, channel] of guild.channels.cache) {
        if (channel) {
          channel.messages.fetch()
        }
      }
    }
  }
}

export = WOKCommands
