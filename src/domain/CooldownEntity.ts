import { DateTime } from "luxon";
export class CooldownEntity {
  private readonly _guildId: string
  private readonly _commandId: string;

  private readonly _userId: string | null;

  private readonly _name: string
  private readonly _type: string
  private _secondsRemaining: number
  // TODO: adding for future-proofing - would it be more efficient to store the time the cooldown was created and the length of the cooldown
  // then calculate on-demand when a user tries to use the command?
  private _createdDateTime: DateTime
  private _cooldownPeriodInSeconds: number


  constructor({ guildId, commandId, userId, name, type, cooldownPeriodInSeconds }: { guildId: string, commandId: string, userId?: string, name: string, type: string, cooldownPeriodInSeconds: number }) {
    this._guildId = guildId
    this._commandId = commandId
    this._userId = userId || null
    this._name = name
    this._type = type
    this._createdDateTime = DateTime.utc()
    this._secondsRemaining = cooldownPeriodInSeconds;
    this._cooldownPeriodInSeconds = cooldownPeriodInSeconds;
  }

  decrementTimeRemaining(numberOfSeconds: number): void {
    this._secondsRemaining = this._secondsRemaining - numberOfSeconds;
  }

  public get guildId(): string {
    return this._guildId;
  }

  public get commandId(): string {
    return this._commandId;
  }

  public get userId(): string | null {
    return this._userId;
  }

  public get name(): string {
    return this._name;
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

// TODO: remove
// export = CooldownEntity

// const schema = new Schema({
//   // Command-GuildID or Command-GuildID-UserID
//   _id: reqString,
//   name: reqString,
//   type: reqString,
//   cooldown: {
//     type: Number,
//     required: true,
//   },
// })
