import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { AuthenticationEntity } from '../entities';
import { encodeString, generateHash } from '../utils';

@EventSubscriber()
export class AuthenticationSubscriber
  implements EntitySubscriberInterface<AuthenticationEntity>
{
  listenTo() {
    return AuthenticationEntity;
  }

  public async beforeInsert({
    entity,
  }: InsertEvent<AuthenticationEntity>): Promise<void> {
    if (entity.password) {
      entity.password = await generateHash(entity.password);
    }

    if (entity.emailAddress) {
      entity.emailAddress = entity.emailAddress.toLowerCase();
    }
  }

  public async beforeUpdate({
    entity,
    databaseEntity,
  }: UpdateEvent<AuthenticationEntity>): Promise<void> {
    if (entity.password) {
      const password = await generateHash(entity.password);

      if (password !== databaseEntity?.password) {
        entity.password = password;
      }
    }

    if (entity.currentHashedRefreshToken) {
      /**
       * the token is longer than 72 characters, so it needs to be encoded first with sha256
       */
      const currentHashedRefreshToken = encodeString(
        entity.currentHashedRefreshToken,
      );

      entity.currentHashedRefreshToken = await generateHash(
        currentHashedRefreshToken,
      );
    }
  }
}
