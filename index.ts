import { Client, Guild } from 'discord.js'
import path from 'path'
import CommandHandler from './CommandHandler'
import FeatureHandler from './FeatureHandler'
import mongo from './mongo'
import prefixes from './models/prefixes'
import getAllFiles from './get-all-files'

class WOKCommands {
  private _defaultPrefix = '!'
  private _commandsDir = 'commands'
  private _featureDir = ''
  private _mongo = ''
  private _syntaxError = 'Incorrect usage!'
  private _prefixes: { [name: string]: string } = {}
  private _commandHandler: CommandHandler
  private _featureHandler: FeatureHandler | null = null

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

    setTimeout(() => {
      if (this._mongo) {
        mongo(this._mongo)
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

      console.log(this._prefixes)
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

  public get commandHandler(): CommandHandler {
    return this._commandHandler
  }
}

export = WOKCommands
