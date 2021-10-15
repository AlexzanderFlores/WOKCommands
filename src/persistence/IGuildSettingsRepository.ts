import { IGuildSettingsEntity } from "../domain/GuildSettingsEntity";

export interface IGuildSettingsRepository {
  getByGuildId(guildId: string): Promise<IGuildSettingsEntity>
  getAll(): Promise<IGuildSettingsEntity[]>
  save(settings: IGuildSettingsEntity): Promise<IGuildSettingsEntity>
}