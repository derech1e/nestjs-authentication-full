import { Injectable } from '@nestjs/common';
import { AuthenticationEntity } from 'src/authentication/entities';
import { QueryRunner } from 'typeorm';
import { CreateUserDto } from '../dtos';
import { UserEntity } from '../entities';
import { UserRepository } from '../repositories';

@Injectable()
export class UserService {
  constructor(private readonly _userRepository: UserRepository) {}

  public async createUser(
    createUserDto: CreateUserDto,
    authentication: AuthenticationEntity,
    queryRunner: QueryRunner,
  ): Promise<UserEntity> {
    const user = this._userRepository.create({
      ...createUserDto,
      authentication,
    });
    return queryRunner.manager.save(user);
  }

  public async getUser(uuid: string): Promise<UserEntity | undefined> {
    return this._userRepository.findOne({ uuid });
  }
}
