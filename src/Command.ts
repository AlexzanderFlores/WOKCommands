import { Client, Message } from 'discord.js'
import WOKCommands from '.'

import permissions from './permissions'
import ICommand from './interfaces/ICommand'
import cooldownSchema from './models/cooldown'

class Command {
  private instance: WOKCommands
  private client: Client
  private _names: string[] = []
  private _category = ''
  private _minArgs: number = 0
  private _maxArgs: number = -1
  private _syntaxError?: { [key: string]: string }
  private _expectedArgs?: string
  private _description?: string
  private _requiredPermissions?: permissions | undefined
  private _requiredRoles?: Map<String, string[]> = new Map() // <GuildID, RoleIDs[]>
  private _callback: Function = () => {}
  private _error: Function | null = null
  private _disabled: string[] = []
  private _cooldownDuration = 0
  private _cooldownChar = ''
  private _cooldown: string
  private _userCooldowns: Map<String, number> = new Map() // <GuildID-UserID, Seconds> OR <dm-UserID, Seconds>
  private _globalCooldown: string
  private _guildCooldowns: Map<String, number> = new Map() // <GuildID, Seconds>
  private _databaseCooldown = false
  private _ownerOnly = false
  private _hidden = false
  private _guildOnly = false
  private _testOnly = false
  private _slash: boolean | string = false

  constructor(
    instance: WOKCommands,
    client: Client,
    names: string[],
    callback: Function,
    error: Function,
    {
      category,
      minArgs,
      maxArgs,
      syntaxError,
      expectedArgs,
      description,
      requiredPermissions,
      permissions,
      cooldown,
      globalCooldown,
      ownerOnly = false,
      hidden = false,
      guildOnly = false,
      testOnly = false,
      slash = false,
    }: ICommand
  ) {
    this.instance = instance
    this.client = client
    this._names = typeof names === 'string' ? [names] : names
    this._category = category
    this._minArgs = minArgs || 0
    this._maxArgs = maxArgs === undefined ? -1 : maxArgs
    if (typeof syntaxError === 'string') {
      console.warn(
        `WOKCommands > String syntax errors are deprecated. Please use an object instead to specify the language. See https://github.com/AlexzanderFlores/WOKCommands#storing-custom-messages-and-translations`
      )
      syntaxError = {
        english: syntaxError,
      }
    }
    this._syntaxError = syntaxError
    this._expectedArgs = expectedArgs
    this._description = description
    this._requiredPermissions = requiredPermissions || permissions
    this._cooldown = cooldown || ''
    this._globalCooldown = globalCooldown || ''
    this._ownerOnly = ownerOnly
    this._hidden = hidden
    this._guildOnly = guildOnly
    this._testOnly = testOnly
    this._callback = callback
    this._error = error
    this._slash = slash

    if (this.cooldown && this.globalCooldown) {
      throw new Error(
        `Command "${names[0]}" has both a global and per-user cooldown. Commands can only have up to one of these properties.`
      )
    }

    if (requiredPermissions && permissions) {
      throw new Error(
        `Command "${names[0]}" has both requiredPermissions and permissions fields. These are interchangeable but only one should be provided.`
      )
    }

    if (this.cooldown) {
      this.verifyCooldown(this._cooldown, 'cooldown')
    }

    if (this.globalCooldown) {
      this.verifyCooldown(this._globalCooldown, 'global cooldown')
    }

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
    if (
      this._ownerOnly &&
      !this.instance.botOwner.includes(message.author.id)
    ) {
      message.reply(
        this.instance.messageHandler.get(message.guild, 'BOT_OWNERS_ONLY')
      )
      return
    }

    if (this.guildOnly && !message.guild) {
      message.reply(
        this.instance.messageHandler.get(message.guild, 'GUILD_ONLY_COMMAND')
      )
      return
    }

    this._callback({
      message,
      channel: message.channel,
      args,
      text: args.join(' '),
      client: this.client,
      prefix: this.instance.getPrefix(message.guild),
      instance: this.instance,
    })
  }

  public get names(): string[] {
    return this._names
  }

  public get category(): string {
    return this._category
  }

  public get minArgs(): number {
    return this._minArgs
  }

  public get maxArgs(): number {
    return this._maxArgs
  }

  public get syntaxError(): { [key: string]: string } {
    return this._syntaxError || {}
  }

  public get expectedArgs(): string | undefined {
    return this._expectedArgs
  }

  public get description(): string | undefined {
    return this._description
  }

  public get requiredPermissions(): permissions | undefined {
    return this._requiredPermissions
  }

  public get cooldownDuration(): number {
    return this._cooldownDuration
  }

  public get cooldownChar(): string {
    return this._cooldownChar
  }

  public get cooldown(): string {
    return this._cooldown
  }

  public get globalCooldown(): string {
    return this._globalCooldown
  }

  public get testOnly(): boolean {
    return this._testOnly
  }

  public verifyCooldown(cooldown: string, type: string) {
    if (typeof cooldown !== 'string') {
      throw new Error(
        `Invalid ${type} format! Must be a string, examples: "10s" "5m" etc.`
      )
    }

    const results = cooldown.match(/[a-z]+|[^a-z]+/gi) || []
    if (results.length !== 2) {
      throw new Error(
        `Invalid ${type} format! Please provide "<Duration><Type>", examples: "10s" "5m" etc.`
      )
    }

    this._cooldownDuration = +results[0]
    if (isNaN(this._cooldownDuration)) {
      throw new Error(`Invalid ${type} format! Number is invalid.`)
    }

    this._cooldownChar = results[1]
    if (
      this._cooldownChar !== 's' &&
      this._cooldownChar !== 'm' &&
      this._cooldownChar !== 'h' &&
      this._cooldownChar !== 'd'
    ) {
      throw new Error(
        `Invalid ${type} format! Unknown type. Please provide 's', 'm', 'h', or 'd' for seconds, minutes, hours, or days respectively.`
      )
    }

    if (
      type === 'global cooldown' &&
      this._cooldownChar === 's' &&
      this._cooldownDuration < 60
    ) {
      throw new Error(
        `Invalid ${type} format! The minimum duration for a global cooldown is 1m.`
      )
    }

    const moreInfo =
      ' For more information please see https://github.com/AlexzanderFlores/WOKCommands#command-cooldowns'

    if (this._cooldownDuration < 1) {
      throw new Error(
        `Invalid ${type} format! Durations must be at least 1.${moreInfo}`
      )
    }

    if (
      (this._cooldownChar === 's' || this._cooldownChar === 'm') &&
      this._cooldownDuration > 60
    ) {
      throw new Error(
        `Invalid ${type} format! Second or minute durations cannot exceed 60.${moreInfo}`
      )
    }

    if (this._cooldownChar === 'h' && this._cooldownDuration > 24) {
      throw new Error(
        `Invalid ${type} format! Hour durations cannot exceed 24.${moreInfo}`
      )
    }

    if (this._cooldownChar === 'd' && this._cooldownDuration > 365) {
      throw new Error(
        `Invalid ${type} format! Day durations cannot exceed 365.${moreInfo}`
      )
    }
  }

  public get hidden(): boolean {
    return this._hidden
  }

  public get guildOnly(): boolean {
    return this._guildOnly
  }

  public verifyDatabaseCooldowns(connected: boolean) {
    if (
      this._cooldownChar === 'd' ||
      this._cooldownChar === 'h' ||
      (this._cooldownChar === 'm' && this._cooldownDuration >= 5)
    ) {
      this._databaseCooldown = true

      if (!connected) {
        console.warn(
          `WOKCommands > A database connection is STRONGLY RECOMMENDED for cooldowns of 5 minutes or more.`
        )
      }
    }
  }

  /**
   * Decrements per-user and global cooldowns
   * Deletes expired cooldowns
   */
  public decrementCooldowns() {
    for (const map of [this._userCooldowns, this._guildCooldowns]) {
      if (typeof map !== 'string') {
        map.forEach((value, key) => {
          if (--value <= 0) {
            map.delete(key)
          } else {
            map.set(key, value)
          }

          if (this._databaseCooldown && this.instance.isDBConnected) {
            this.updateDatabaseCooldowns(`${this.names[0]}-${key}`, value)
          }
        })
      }
    }
  }

  public async updateDatabaseCooldowns(_id: String, cooldown: number) {
    // Only update every 20s
    if (cooldown % 20 === 0) {
      const type = this.globalCooldown ? 'global' : 'per-user'

      if (cooldown <= 0) {
        await cooldownSchema.deleteOne({ _id, name: this.names[0], type })
      } else {
        await cooldownSchema.findOneAndUpdate(
          {
            _id,
            name: this.names[0],
            type,
          },
          {
            _id,
            name: this.names[0],
            type,
            cooldown,
          },
          { upsert: true }
        )
      }
    }
  }

  public setCooldown(guildId: string, userId: string, customCooldown?: number) {
    const target = this.globalCooldown || this.cooldown

    if (target) {
      let seconds = customCooldown || this._cooldownDuration
      const durationType = customCooldown ? 's' : this._cooldownChar

      switch (durationType) {
        case 'm':
          seconds *= 60
          break

        case 'h':
          seconds *= 60 * 60
          break

        case 'd':
          seconds *= 60 * 60 * 24
          break
      }

      // Increment to ensure we save it to the database when it is divisible by 20
      ++seconds

      if (this.globalCooldown) {
        this._guildCooldowns.set(guildId, seconds)
      } else {
        this._userCooldowns.set(`${guildId}-${userId}`, seconds)
      }
    }
  }

  public getCooldownSeconds(guildId: string, userId: string): string {
    let seconds = this.globalCooldown
      ? this._guildCooldowns.get(guildId)
      : this._userCooldowns.get(`${guildId}-${userId}`)

    if (!seconds) {
      return ''
    }

    const days = Math.floor(seconds / (3600 * 24))
    const hours = Math.floor((seconds % (3600 * 24)) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    seconds = Math.floor(seconds % 60)

    let result = ''

    if (days) {
      result += `${days}d `
    }

    if (hours) {
      result += `${hours}h `
    }

    if (minutes) {
      result += `${minutes}m `
    }

    if (seconds) {
      result += `${seconds}s `
    }

    return result.substring(0, result.length - 1)
  }

  public addRequiredRole(guildId: string, roleId: string) {
    const array = this._requiredRoles?.get(guildId) || []
    if (!array.includes(roleId)) {
      array.push(roleId)
      this._requiredRoles?.set(guildId, array)
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

  public get error(): Function | null {
    return this._error
  }

  public get slash(): boolean | string {
    return this._slash
  }
}

export = Command
