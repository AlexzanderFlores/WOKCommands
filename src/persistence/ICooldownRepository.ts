import { CooldownEntity } from "../domain/CooldownEntity";

export interface ICooldownRepository {
  save(cooldown: CooldownEntity): Promise<CooldownEntity>
}
