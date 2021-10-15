import { ICooldownEntity } from '../../domain/CooldownEntity';
import { ICooldownRepository } from '../ICooldownRepository';

export class MongoCooldownRepository implements ICooldownRepository {
  save(cooldown: ICooldownEntity): Promise<ICooldownEntity> {
    throw new Error('Method not implemented.');
  }
}
