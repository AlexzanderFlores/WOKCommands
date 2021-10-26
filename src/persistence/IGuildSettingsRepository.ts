import { GuildSettingsAggregate } from "../domain/GuildSettingsAggregate";

export interface IGuildSettingsRepository {
  findOne(input: { guildId: string }): Promise<GuildSettingsAggregate>
  findAll(): Promise<GuildSettingsAggregate[]>
  save(settings: GuildSettingsAggregate): Promise<GuildSettingsAggregate>
}
