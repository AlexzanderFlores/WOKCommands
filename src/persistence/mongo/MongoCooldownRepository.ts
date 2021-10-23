import { ICooldownEntity } from '../../domain/CooldownEntity';
import { ICooldownRepository } from '../ICooldownRepository';

export class MongoCooldownRepository implements ICooldownRepository {
  save(cooldown: CooldownEntity): Promise<CooldownEntity> {
    throw new Error('Method not implemented.');
  }
}
