
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { AuthenticationEntity } from '../entities';
import { generateHash } from '../utils';

@EventSubscriber()
export class AuthenticationSubscriber
  implements EntitySubscriberInterface<AuthenticationEntity>
{
  listenTo() {
    return AuthenticationEntity;
  }

  async beforeInsert({
    entity,
  }: InsertEvent<AuthenticationEntity>): Promise<void> {
    if (entity.password) {
      entity.password = await generateHash(entity.password);
    }

    if (entity.emailAddress) {
      entity.emailAddress = entity.emailAddress.toLowerCase();
    }
  }
}
