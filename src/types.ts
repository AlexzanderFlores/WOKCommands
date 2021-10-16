import type {
  ApplicationCommandOptionData,
  Client,
  CommandInteraction,
  Guild,
  GuildMember,
  Message,
  PermissionString,
  TextChannel,
  User,
} from "discord.js/typings/index.js";
import type WOKCommands from ".";

interface OptionsWithS {
  commandDir?: never;
  featureDir?: never;

  commandsDir: string;
  featuresDir?: string;
  messagesPath?: string;
  mongoUri?: string;
  showWarns?: boolean;
  delErrMsgCooldown?: number;
  defaultLanguage?: string;
  ignoreBots?: boolean;
  dbOptions?: {};
  testServers?: string | string[];
  botOwners?: string | string[];
  disabledDefaultCommands?: string | string[];
  typeScript?: boolean;
  ephemeral?: boolean;
  debug?: boolean;
}

interface OptionsWithoutS {
  commandsDir?: never;
  featuresDir?: never;

  commandDir: string;
  featureDir?: string;
  messagesPath?: string;
  mongoUri?: string;
  showWarns?: boolean;
  delErrMsgCooldown?: number;
  defaultLanguage?: string;
  ignoreBots?: boolean;
  dbOptions?: {};
  testServers?: string | string[];
  botOwners?: string | string[];
  disabledDefaultCommands?: string | string[];
  typeScript?: boolean;
  ephemeral?: boolean;
  debug?: boolean;
}

export type Options = OptionsWithS | OptionsWithoutS;

export interface ICallbackObject {
  channel: TextChannel;
  message: Message;
  args: string[];
  text: string;
  client: Client;
  prefix: string;
  instance: WOKCommands;
  interaction: CommandInteraction;
  options: ApplicationCommandOptionData[];
  user: User;
  member: GuildMember;
  guild: Guild | null;
  cancelCoolDown(): any;
}

export interface IErrorObject {
  error: CommandErrors;
  command: string;
  message: Message;
  info: object;
}

export type optionTypes =
  | "SUB_COMMAND"
  | "SUB_COMMAND_GROUP"
  | "STRING"
  | "INTEGER"
  | "BOOLEAN"
  | "USER"
  | "CHANNEL"
  | "ROLE"
  | "MENTIONABLE"
  | "NUMBER";

export interface ICommand {
  names?: string[] | string;
  aliases?: string[] | string;
  category: string;
  description: string;
  callback?(obj: ICallbackObject): any;
  error?(obj: IErrorObject): any;
  minArgs?: number;
  maxArgs?: number;
  syntaxError?: { [key: string]: string };
  expectedArgs?: string;
  expectedArgsTypes?: optionTypes[];
  syntax?: string;
  requiredPermissions?: PermissionString[];
  permissions?: PermissionString[];
  cooldown?: string;
  globalCooldown?: string;
  ownerOnly?: boolean;
  hidden?: boolean;
  guildOnly?: boolean;
  testOnly?: boolean;
  slash?: boolean | "both";
  options?: ApplicationCommandOptionData[];
  requireRoles?: boolean;
}

export interface ISlashCommand {
  id: string;
  application_id: string;
  name: string;
  description: string;
  version: string;
  default_permission: boolean;
}

export interface ICategorySetting {
  name: string;
  emoji: string;
  hidden?: boolean;
  customEmoji?: boolean;
}

export enum CommandErrors {
  EXCEPTION = "EXCEPTION",
  COOLDOWN = "COOLDOWN",
  INVALID_ARGUMENTS = "INVALID ARGUMENTS",
  MISSING_PERMISSIONS = "MISSING PERMISSIONS",
  MISSING_ROLES = "MISSING ROLES",
  COMMAND_DISABLED = "COMMAND DISABLED",
}

export enum Events {
  DATABASE_CONNECTED = "databaseConnected",
  LANGUAGE_NOT_SUPPORTED = "languageNotSupported",
  COMMAND_EXCEPTION = "commandException",
}
