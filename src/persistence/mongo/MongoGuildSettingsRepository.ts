import { IGuildSettingsEntity } from "../../domain/GuildSettingsEntity";
import { IGuildSettingsRepository } from "../IGuildSettingsRepository";
import prefixes from './models/prefixes'

export class MongoGuildSettingsRepository implements IGuildSettingsRepository {
  getByGuildId(guildId: string): Promise<IGuildSettingsEntity> {
    throw new Error("Method not implemented.");
  }
  getAll(): Promise<IGuildSettingsEntity[]> {
    throw new Error("Method not implemented.");
  }
  save(settings: IGuildSettingsEntity): Promise<IGuildSettingsEntity> {
    throw new Error("Method not implemented.");
    // await prefixes.findOneAndUpdate(
    //   {
    //     _id: id,
    //   },
    //   {
    //     _id: id,
    //     prefix: text,
    //   },
    //   {
    //     upsert: true,
    //   }
    // )
  }
}