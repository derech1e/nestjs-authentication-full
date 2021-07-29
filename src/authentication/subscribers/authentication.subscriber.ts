import { UtilService } from 'src/util/services/util.service';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { AuthenticationEntity } from '../entities';

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
      entity.password = await UtilService.generateHash(entity.password);
    }

    if (entity.emailAddress) {
      entity.emailAddress = UtilService.lowerCase(entity.emailAddress);
    }
  }
}
