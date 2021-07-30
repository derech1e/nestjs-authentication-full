import { Request } from 'express';
import { UserEntity } from 'src/user/entities';

export interface RequestWithUser extends Request {
  user: UserEntity;
}
