import { Collection } from "discord.js"
import CommandErrors from "../enums/CommandErrors"
import { Channel } from "./Channel"
import { CommandEntity } from "./CommandEntity"
import { GuildLanguage } from './GuildLanguage'
import { GuildPrefix } from "./GuildPrefix"
import { Role } from "./Role"

export class GuildSettingsAggregate {
  private readonly _guildId: string
  private readonly _commands: Collection<string, CommandEntity> = new Collection()
  private _language: GuildLanguage
  private _prefix: GuildPrefix

  constructor({ guildId, guildPrefix, guildLanguage }: { guildId: string, guildPrefix?: GuildPrefix, guildLanguage?: GuildLanguage }) {
    this._guildId = guildId

    if (guildPrefix) {
      this._prefix = guildPrefix
    } else {
      this._prefix = new GuildPrefix({ value: '!' })
    }

    if (guildLanguage) {
      this._language = guildLanguage
    } else {
      this._language = new GuildLanguage({ value: 'english' })
    }
  }

  public setPrefix({ prefix }: { prefix: GuildPrefix }) {
    this._prefix = prefix
  }

  public setLanguage({ language }: { language: GuildLanguage }) {
    this._language = language
  }

  public setRequiredChannelsForCommand({ commandId, channels }: { commandId: string, channels: Channel[] }) {
    let commandEntity = this.commands.get(commandId)
    if (!commandEntity) {
      commandEntity = new CommandEntity({
        commandId,
        channels
      })
      this.commands.set(commandId, commandEntity)
      return
    }

    commandEntity.setChannels({ channels })
  }

  public setEnabledStateForCommand({ commandId, isEnabled }: { commandId: string, isEnabled: boolean }) {
    let commandEntity = this.commands.get(commandId)
    if (!commandEntity) {
      commandEntity = new CommandEntity({
        commandId,
        isEnabled
      })
      this.commands.set(commandId, commandEntity)
      return
    }

    commandEntity.setIsEnabled({ isEnabled })
  }

  public addRequiredRoleForCommand({ commandId, role }: { commandId: string, role: Role }) {
    let commandEntity = this.commands.get(commandId)
    if (!commandEntity) {
      commandEntity = new CommandEntity({
        commandId,
        requiredRoles: [role]
      })
      this.commands.set(commandId, commandEntity)
      return
    }

    const requiredRoles = commandEntity.requiredRoles || new Collection<string, Role>()
    commandEntity.addRequiredRole({ role })
  }

  public setRequiredRolesForCommand({ commandId, requiredRoles }: { commandId: string, requiredRoles: Role[] }) {
    let commandEntity = this.commands.get(commandId)
    if (!commandEntity) {
      commandEntity = new CommandEntity({
        commandId,
        requiredRoles
      })
      this.commands.set(commandId, commandEntity)
      return
    }

    commandEntity.setRequiredRoles({ requiredRoles })
  }

  public clearRequiredRolesForCommand({ commandId }: { commandId: string }) {
    let commandEntity = this.commands.get(commandId)
    if (!commandEntity) {
      throw new Error(CommandErrors.COMMAND_NOT_FOUND)
    }
    commandEntity.setRequiredRoles({ requiredRoles: null })
  }

  public removeRequiredRoleForCommand({ commandId, roleId }: { commandId: string, roleId: string }) {
    let commandEntity = this.commands.get(commandId)
    if (!commandEntity) {
      throw new Error(CommandErrors.COMMAND_NOT_FOUND)
    }
    commandEntity.removeRequiredRole({ roleId })
  }

  public get guildId(): string {
    return this._guildId
  }

  public get prefix(): GuildPrefix {
    return this._prefix
  }

  public get commands(): Collection<string, CommandEntity> {
    return this._commands
  }

  public get language(): GuildLanguage {
    return this._language
  }
}