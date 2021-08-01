import { Controller, Get, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { RoleType } from 'src/authentication/constants';
import { Authorization } from 'src/authentication/decorators';
import { RequestWithUser } from 'src/authentication/interfaces';
import { UserEntity } from '../entities';

@Controller('User')
export class UserController {
  @Authorization(RoleType.USER)
  @Get()
  @HttpCode(HttpStatus.OK)
  public async getUser(@Req() { user }: RequestWithUser): Promise<UserEntity> {
    return user;
  }
}
