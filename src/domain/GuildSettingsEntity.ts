import { Collection } from "discord.js";
import { ICommandEntity } from "./CommandEntity";
import { IGuildLanguage } from './GuildLanguage';
import { IGuildPrefix } from "./GuildPrefix";

export interface IGuildSettingsEntity {
  readonly guildId: string
  readonly commands: Collection<string, ICommandEntity>
  readonly languages: Collection<string, IGuildLanguage>
  readonly prefix: string | null
  createOrUpdatePrefix(prefix: string): void
}

export class GuildSettingsEntity implements IGuildSettingsEntity {
  private readonly _guildId: string;
  private readonly _commands: Collection<string, ICommandEntity> = new Collection();
  private readonly _languages: Collection<string, IGuildLanguage> = new Collection();
  private _prefix: string | null = null;

  constructor({ guildId }: { guildId: string }) {
    this._guildId = guildId;
  }

  createOrUpdatePrefix(prefix: string): void {
    this._prefix = prefix;
  }

  public get guildId(): string {
    return this._guildId;
  }

  public get prefix(): string | null {
    return this._prefix;
  }

  public get commands(): Collection<string, ICommandEntity> {
    return this._commands;
  }

  public get languages(): Collection<string, IGuildLanguage> {
    return this._languages;
  }
}

// export = GuildSettingsEntity;

// guildId: reqString,
// commands: {
//   command: reqString,
//   isEnabled: Boolean, // todo: is there a way to default these booleans? do we need a wrapper type like reqString?
//   isChannelCommand: Boolean,
//   requiredRoles: {
//     type: [String],
//     required: true, // todo: does this need to be required?
//   },
//   channels: {
//     type: [String],
//     required: false, // todo: in domain model make sure this is required if isChannelCommand is true
//   },
// },
// languages: {
//   type: [String],
//   required: true, // todo: does this need to be required?
// },
// prefixes: {
//   type: [String],
//   required: false // todo:
// }
