import { CooldownEntity } from "../domain/CooldownEntity";

export interface WhereOneInput {
  commandId: string,
  guildId: string,
  userId?: string
}
export interface ICooldownRepository {
  findOne(input: { commandId: string, guildId: string, userId?: string }): Promise<CooldownEntity>
  delete(input: { commandId: string, guildId: string, userId?: string }): Promise<void>
  save(cooldown: CooldownEntity): Promise<CooldownEntity>
}
