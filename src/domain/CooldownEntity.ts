import { DateTime } from "luxon";

export type CooldownType = 'global' | 'per-user';

interface BaseCooldownCreateInput {
  guildId: string,
  commandId: string,
  cooldownPeriodInSeconds: number
}

interface UserCooldownCreateInput extends BaseCooldownCreateInput {
  userId: string,
  type: 'per-user'
}

interface GlobalCooldownCreateInput extends BaseCooldownCreateInput {
  type: 'global'
}
export class CooldownEntity {
  private readonly _guildId: string
  private readonly _commandId: string;
  private readonly _userId?: string;
  private readonly _type: CooldownType
  private _secondsRemaining: number
  // TODO: adding for future-proofing - would it be more efficient to store the time the cooldown was created and the length of the cooldown
  // then calculate on-demand when a user tries to use the command?
  private _createdDateTime: DateTime
  private _cooldownPeriodInSeconds: number


  constructor({ guildId, commandId, type, cooldownPeriodInSeconds, userId }: {
    guildId: string,
    commandId: string,
    cooldownPeriodInSeconds: number,
    type: CooldownType,
    userId?: string
  }) {
    if (type === 'per-user') {
      if (!userId) {
        throw new Error('WOK Commands > a userId must be supplied when creating a per-user cooldown')
      }
      this._userId = userId
    } else if (type === 'global') {
      this._userId = undefined
    } else {
      throw new Error('WOK Commands > unknown CooldownType')
    }

    this._guildId = guildId
    this._commandId = commandId
    this._type = type
    this._createdDateTime = DateTime.utc()
    this._secondsRemaining = cooldownPeriodInSeconds;
    this._cooldownPeriodInSeconds = cooldownPeriodInSeconds;
  }

  public decrementTimeRemaining({ numberOfSeconds }: { numberOfSeconds: number }): void {
    this._secondsRemaining = this._secondsRemaining - numberOfSeconds;
  }

  public get guildId(): string {
    return this._guildId;
  }

  public get commandId(): string {
    return this._commandId;
  }

  public get userId(): string | undefined {
    return this._userId;
  }

  public get type(): string {
    return this._type;
  }

  public get createdDateTime(): DateTime {
    return this._createdDateTime;
  }

  public get secondsRemaining(): number {
    return this._secondsRemaining;
  }

  public get cooldownPeriodInSeconds(): number {
    return this._cooldownPeriodInSeconds;
  }
}
