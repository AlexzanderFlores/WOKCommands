import { GuildSettingsAggregate } from "../domain/GuildSettingsAggregate";

export interface IGuildSettingsRepository {
  getByGuildId(guildId: string): Promise<GuildSettingsAggregate>
  getAll(): Promise<GuildSettingsAggregate[]>
  save(settings: GuildSettingsAggregate): Promise<GuildSettingsAggregate>
}
