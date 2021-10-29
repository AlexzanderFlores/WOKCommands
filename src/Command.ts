import { Client, Message } from 'discord.js'
import WOKCommands from '.'

import permissions from './permissions'
import { ICommand } from '../typings'
import { CommandEntity } from './domain/CommandEntity'
import { Channel } from './domain/Channel'
import { Role } from './domain/Role'
import { CooldownEntity, CooldownType } from './domain/CooldownEntity'

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
  private _callback: Function = () => {}
  private _error: Function | null = null
  private _cooldownDuration = 0
  private _cooldownChar = ''
  private _cooldown: string
  private _userCooldowns: Map<String, CooldownEntity> = new Map() // <GuildID-UserID, Seconds> OR <dm-UserID, Seconds>
  private _globalCooldown: string
  private _guildCooldowns: Map<String, CooldownEntity> = new Map() // <GuildID, Seconds>
  private _databaseCooldown = false
  private _ownerOnly = false
  private _hidden = false
  private _guildOnly = false
  private _testOnly = false
  private _slash: boolean | string = false
  private _requireRoles = false

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
      requireRoles = false,
    }: ICommand
  ) {
    this.instance = instance
    this.client = client
    this._names = typeof names === 'string' ? [names] : names
    this._category = category
    this._minArgs = minArgs || 0
    this._maxArgs = maxArgs === undefined ? -1 : maxArgs
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
    this._requireRoles = requireRoles

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

  public async execute(message: Message, args: string[]) {
    const reply = await this._callback({
      message,
      channel: message.channel,
      args,
      text: args.join(' '),
      client: this.client,
      prefix: this.instance.getPrefix(message.guild),
      instance: this.instance,
      user: message.author,
      member: message.member,
      guild: message.guild,
      // TODO: where is this used?
      cancelCoolDown: async () => {
        if (!message.guild?.id) {
          throw new Error('A guildId must be provided to cancel a cooldown!')
        }
        await this.cancelUserCooldown({ guildId: message.guild?.id, userId: message.author.id })
      },
    })

    if (!reply) {
      return
    }

    if (typeof reply === 'string') {
      message.reply({
        content: reply,
      })
    } else if (typeof reply === 'object') {
      if (reply.custom) {
        message.reply(reply)
      } else {
        let embeds = []

        if (Array.isArray(reply)) {
          embeds = reply
        } else {
          embeds.push(reply)
        }

        message.reply({
          embeds,
        })
      }
    }
  }

  public get names(): string[] {
    return this._names
  }

  public get category(): string {
    return this._category
  }

  public get description(): string | undefined {
    return this._description
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
      ' For more information please see https://docs.wornoffkeys.com/commands/command-cooldowns'

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

  public get ownerOnly(): boolean {
    return this._ownerOnly
  }

  public verifyDatabaseCooldowns() {
    if (
      this._cooldownChar === 'd' ||
      this._cooldownChar === 'h' ||
      (this._cooldownChar === 'm' && this._cooldownDuration >= 5)
    ) {
      this._databaseCooldown = true

      if (!this.instance.isDBConnected()) {
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
          value.decrementTimeRemaining({ numberOfSeconds: 1 })
          if (value.secondsRemaining <= 0) {
            map.delete(key)
          }

          if (this._databaseCooldown && this.instance.isDBConnected()) {
            this.updateDatabaseCooldowns(value)
          }
        })
      }
    }
  }

  public async cancelUserCooldown({ guildId, userId }: { guildId: string, userId: string }) {
    await this.instance.cooldownRepository.delete({ guildId, userId, commandId: this.defaultName });
  }

  public async updateDatabaseCooldowns(cooldownEntity: CooldownEntity) {
    // Only update every 20s
    if (cooldownEntity.secondsRemaining % 20 === 0 && this.instance.isDBConnected()) {
      const type: CooldownType = this.globalCooldown ? 'global' : 'per-user'
      if (cooldownEntity.secondsRemaining <= 0) {
        const { guildId, userId, commandId } = cooldownEntity 
        await this.instance.cooldownRepository.delete({ guildId, userId, commandId });
      } else {
        await this.instance.cooldownRepository.save(cooldownEntity);
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
        const cooldownEntity = new CooldownEntity({
          guildId,
          cooldownPeriodInSeconds: seconds,
          commandId: this.defaultName,
          type: 'global'
        })
        this._guildCooldowns.set(guildId, cooldownEntity)
      } else {
        const cooldownEntity = new CooldownEntity({
          guildId,
          cooldownPeriodInSeconds: seconds,
          commandId: this.defaultName,
          type: 'per-user',
          userId
        })
        this._userCooldowns.set(`${guildId}-${userId}`, cooldownEntity)
      }
    }
  }

  public getCooldownSeconds(guildId: string, userId: string): string {
    const cooldown = this.globalCooldown
      ? this._guildCooldowns.get(guildId)
      : this._userCooldowns.get(`${guildId}-${userId}`)

    const secondsRemaining = cooldown?.secondsRemaining;
    if (!secondsRemaining) {
      return ''
    }

    const days = Math.floor(secondsRemaining / (3600 * 24))
    const hours = Math.floor((secondsRemaining % (3600 * 24)) / 3600)
    const minutes = Math.floor((secondsRemaining % 3600) / 60)
    const seconds = Math.floor(secondsRemaining % 60)

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

  public async addRequiredRole(guildId: string, roleId: string) {
    const guildSettings = this.instance.getOrCreateGuildSettings(guildId)

    guildSettings.addRequiredRoleForCommand({
      // TODO: should we take command name from input there or get it from this.names[0]?
      commandId: this.defaultName,
      role: new Role({ roleId })
    })

    console.error(JSON.stringify(guildSettings, null, 2))
    
    await this.instance.guildSettingsRepository.save(guildSettings)
  }

  public async removeRequiredRole(guildId: string, roleId: string) {
    const guildSettings = this.instance.getOrCreateGuildSettings(guildId)
    if (roleId === 'all') {
      guildSettings.clearRequiredRolesForCommand({ commandId: this.defaultName })
    }

    guildSettings.removeRequiredRoleForCommand({ commandId: this.defaultName, roleId });

    await this.instance.guildSettingsRepository.save(guildSettings)
  }

  public getRequiredRoles(guildId: string): string[] | null {
    const command = this.getCommandEntity(guildId)
    return command?.requiredRoles ? Array.from(command.requiredRoles.keys()) : null
  }

  public get callback(): Function {
    return this._callback
  }

  public async disable(guildId: string) {
    await this.updateCommandIsEnabled({ guildId, isEnabled: false })
  }

  public async enable(guildId: string) {
    await this.updateCommandIsEnabled({ guildId, isEnabled: true })
  }

  public isDisabled(guildId: string): boolean {
    const command = this.getCommandEntity(guildId);
    return command ? !command.isEnabled : false;
  }

  public get error(): Function | null {
    return this._error
  }

  public get slash(): boolean | string {
    return this._slash
  }

  public get doesRequireRoles(): boolean {
    return this._requireRoles
  }

  // TODO: we should be a bit more explicit with this as there are implications if a command default
  // name is ever changed or deleted while aliases can change more freely
  public get defaultName(): string {
    return this.names[0]
  }

  public getRequiredChannels({ guildId } : { guildId: string }): string[] | null {
    const command = this.getCommandEntity(guildId)
    return command?.channels ? Array.from(command.channels.keys()) : null
  }

  public async setRequiredChannels({ guildId, channels }: {
    guildId: string,
    channels: string[]
  }): Promise<void> {
    if (!guildId) {
      return
    }
    const guildSettings = this.instance.getOrCreateGuildSettings(guildId)

    guildSettings.setRequiredChannelsForCommand({
      // TODO: should we take command name from input there or get it from this.names[0]?
      commandId: this.defaultName,
      channels: channels.map(c => (new Channel({ channelId: c })))
    })
    
    await this.instance.guildSettingsRepository.save(guildSettings)
  }

  private getCommandEntity(guildId: string): CommandEntity | null {
    const guildSettings = this.instance.guildSettings.get(guildId)
    const command = guildSettings?.commands.get(this.names[0])

    return command || null;
  }

  private async updateCommandIsEnabled({ guildId, isEnabled }: { guildId: string, isEnabled: boolean }) {
    const guildSettings = this.instance.getOrCreateGuildSettings(guildId)

    guildSettings.setEnabledStateForCommand({
      commandId: this.defaultName,
      isEnabled
    })
    
    await this.instance.guildSettingsRepository.save(guildSettings)
  }
}

export = Command
