import { ICooldownEntity } from "../domain/CooldownEntity";

export interface ICooldownRepository {
  save(cooldown: ICooldownEntity): Promise<ICooldownEntity>
}
