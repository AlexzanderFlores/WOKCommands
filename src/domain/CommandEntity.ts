import { Collection } from "discord.js";
import { Channel } from "./Channel";
import { Role } from "./Role";

export interface ICreateCommandEntityInput { 
  commandId: string
  requiredRoles?: Role[]
  channels?: Channel[]
  isEnabled?: boolean
}

export class CommandEntity {
  private _commandId: string
  private _requiredRoles: Collection<string, Role> | null = null
  private _channels: Collection<string, Channel> | null = null
  private _isEnabled: boolean = true;

  constructor({ commandId, requiredRoles, channels, isEnabled }: { 
    commandId: string
    requiredRoles?: Role[]
    channels?: Channel[]
    isEnabled?: boolean
  }) {
    this._commandId = commandId
    
    if (requiredRoles) {
        this._requiredRoles = requiredRoles.reduce((acc, role) => {
          acc.set(role.roleId, role);
          return acc;
        }, new Collection<string, Role>())
    };

    if (channels) {
      this._channels = channels.reduce((acc, channel) => {
        acc.set(channel.channelId, channel);
        return acc;
      }, new Collection<string, Channel>())
    }

    if (isEnabled !== undefined) {
      this._isEnabled = isEnabled
    }
  }

  public get commandId(): string {
    return this._commandId
  }

  public get channels(): Collection<string, Channel> | null {
    return (!this._channels || this._channels.size === 0) ? null : this._channels
  }

  public get requiredRoles(): Collection<string, Role> | null {
    return (!this._requiredRoles || this._requiredRoles.size === 0) ? null : this.requiredRoles
  }

  public get isEnabled(): boolean {
    return this._isEnabled
  }

  public setIsEnabled({ isEnabled }: { isEnabled: boolean }) {
    this._isEnabled = isEnabled
  }

  public setChannels({ channels }: { channels: Channel[] | null }) {
    this._channels = channels?.reduce((acc, channel) => {
      acc.set(channel.channelId, channel)
      return acc;
    }, new Collection<string, Channel>()) || null
  }

  public setRequiredRoles({ requiredRoles }: { requiredRoles: Role[] | null }) {
    this._requiredRoles = requiredRoles?.reduce((acc, role) => {
      acc.set(role.roleId, role)
      return acc;
    }, new Collection<string, Role>()) || null
  }

  public removeRequiredRole({ roleId }: { roleId: string }) {
    // TODO do we want to throw an error if the role didn't exist for the command?
    this.requiredRoles?.sweep(role => role.roleId === roleId)
    if (this.requiredRoles && this.requiredRoles.size === 0) {
      this._requiredRoles = null;
    }
  }
}
