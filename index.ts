import { Client, Guild } from 'discord.js'
import CommandHandler from './CommandHandler'
import ListenerHandler from './ListenerHandler'
import ICommand from './interfaces/ICommand'

class WOKCommands {
  private _defaultPrefix = '!'
  private _commandsDir = 'commands'
  private _listenerDir = ''
  private _mongo = ''
  private _prefixes: { [name: string]: string } = {}
  private _commandHandler: CommandHandler

  constructor(client: Client, commandsDir?: string, listenerDir?: string) {
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
        if (listenerDir) {
          listenerDir = `${path}/${listenerDir}`
        }
      }
    }

    this._commandsDir = commandsDir || this._commandsDir
    this._listenerDir = listenerDir || this._listenerDir

    this._commandHandler = new CommandHandler(this, client, this._commandsDir)
    if (this._listenerDir) {
      new ListenerHandler(client, this._listenerDir)
    }
  }

  public get mongoPath(): string {
    return this._mongo
  }

  public setMongoPath(mongoPath: string): WOKCommands {
    this._mongo = mongoPath
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

  public get commands(): ICommand[] {
    return this._commandHandler.commands
  }

  public get commandAmount(): number {
    return this.commands.length
  }
}

export = WOKCommands
