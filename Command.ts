import { Client, Message } from 'discord.js'
import WOKCommands from '.'
import ICmdConfig from './interfaces/ICmdConfig'

class Command {
  private instance: WOKCommands
  private client: Client
  private _names: string[] = []
  private _minArgs: number = 0
  private _maxArgs: number = -1
  private _syntaxError?: string
  private _expectedArgs?: string
  private _description?: string
  private _requiredPermissions?: string[] = []
  private _requiredRoles?: Map<String, string[]> = new Map() // <GuildID, RoleIDs[]>
  private _callback: Function = () => {}
  private _disabled: string[] = []

  constructor(
    instance: WOKCommands,
    client: Client,
    names: string[],
    callback: Function,
    {
      minArgs,
      maxArgs,
      syntaxError,
      expectedArgs,
      description,
      requiredPermissions,
    }: ICmdConfig
  ) {
    this.instance = instance
    this.client = client
    this._names = typeof names === 'string' ? [names] : names
    this._minArgs = minArgs || 0
    this._maxArgs = maxArgs === undefined ? -1 : maxArgs
    this._syntaxError = syntaxError
    this._expectedArgs = expectedArgs
    this._description = description
    this._requiredPermissions = requiredPermissions
    this._callback = callback

    if (this._minArgs < 0) {
      throw new Error(
        `Command "${names[0]}" has a minimum argument count less than 0!`
      )
    }

    if (this._maxArgs < -1) {
      throw new Error(
        `Command "${names[0]}" has a maximum argument count less than -1!`
      )
    }

    if (this._maxArgs !== -1 && this._maxArgs < this._minArgs) {
      throw new Error(
        `Command "${names[0]}" has a maximum argument count less than it's minimum argument count!`
      )
    }
  }

  public execute(message: Message, args: string[]) {
    this._callback(
      message,
      args,
      args.join(' '),
      this.client,
      this.instance.getPrefix(message.guild),
      this.instance
    )
  }

  public get names(): string[] {
    return this._names
  }

  public get minArgs(): number {
    return this._minArgs
  }

  public get maxArgs(): number {
    return this._maxArgs
  }

  public get syntaxError(): string | undefined {
    return this._syntaxError
  }

  public get expectedArgs(): string | undefined {
    return this._expectedArgs
  }

  public get description(): string | undefined {
    return this._description
  }

  public get requiredPermissions(): string[] | undefined {
    return this._requiredPermissions
  }

  public addRequiredRole(guildId: string, roleId: string) {
    const array = this._requiredRoles?.get(guildId) || []
    if (!array.includes(roleId)) {
      array.push(roleId)
      this._requiredRoles?.set(guildId, array)

      console.log(`Added ${roleId} to ${this._names[0]} for guild ${guildId}`)
    }
  }

  public removeRequiredRole(guildId: string, roleId: string) {
    if (roleId === 'none') {
      this._requiredRoles?.delete(guildId)
      return
    }

    const array = this._requiredRoles?.get(guildId) || []
    const index = array ? array.indexOf(roleId) : -1
    if (array && index >= 0) {
      array.splice(index, 1)

      console.log(
        `Removed ${roleId} from ${this._names[0]} for guild ${guildId}`
      )
    }
  }

  public getRequiredRoles(guildId: string): string[] {
    const map = this._requiredRoles || new Map()
    return map.get(guildId) || []
  }

  public get callback(): Function {
    return this._callback
  }

  public disable(guildId: string) {
    if (!this._disabled.includes(guildId)) {
      this._disabled.push(guildId)
    }
  }

  public enable(guildId: string) {
    const index = this._disabled.indexOf(guildId)
    if (index >= 0) {
      this._disabled.splice(index, 1)
    }
  }

  public isDisabled(guildId: string) {
    return this._disabled.includes(guildId)
  }
}

export = Command
