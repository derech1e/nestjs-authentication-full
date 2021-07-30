import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { UserEntity } from '../entities';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<UserEntity> {
  listenTo() {
    return UserEntity;
  }

  async beforeInsert({ entity }: InsertEvent<UserEntity>): Promise<void> {
    if (entity.firstName) {
      entity.firstName = entity.firstName;
    }
  }
}
