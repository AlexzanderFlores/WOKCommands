import { Client, GuildMember, Message } from 'discord.js'
import WOKCommands from '.'
import ICmdConfig from './interfaces/ICmdConfig'

class Command {
  private instance: WOKCommands
  private client: Client
  private _names: string[] = []
  private _minArgs: number = 0
  private _maxArgs: number = -1
  private _expectedArgs?: string
  private _description?: string
  private _cooldown: string[] = []
  private _callback: Function = () => {}

  constructor(
    instance: WOKCommands,
    client: Client,
    names: string[],
    callback: Function,
    { minArgs, maxArgs, expectedArgs, description }: ICmdConfig
  ) {
    this.instance = instance
    this.client = client
    this._names = typeof names === 'string' ? [names] : names
    this._minArgs = minArgs || 0
    this._maxArgs = maxArgs || -1
    this._expectedArgs = expectedArgs
    this._description = description
    this._callback = callback
  }

  public execute(message: Message, args: string[]) {
    this._callback(
      message,
      args,
      args.join(' '),
      this.client,
      message.guild
        ? this.instance.prefixes[message.guild.id]
        : this.instance.defaultPrefix
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

  public get expectedArgs(): string | undefined {
    return this._expectedArgs
  }

  public get description(): string | undefined {
    return this._description
  }

  public setCooldown(member: GuildMember | string, seconds: number) {
    if (typeof member !== 'string') {
      member = member.id
    }

    console.log(`Setting cooldown of ${member} for ${seconds}s`)
  }

  public clearCooldown(member: GuildMember | string, seconds: number) {
    if (typeof member !== 'string') {
      member = member.id
    }

    console.log(`Clearing cooldown of ${member} for ${seconds}s`)
  }

  public get callback(): Function {
    return this._callback
  }
}

export = Command
