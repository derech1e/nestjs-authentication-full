import { Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserEntity } from '../entities';
import { UserRepository } from '../repositories';

@Injectable()
export class UserService {
  constructor(private readonly _userRepository: UserRepository) {}

  public async createUser(
    createUserDto: CreateUserDto,
    queryRunner: QueryRunner,
  ): Promise<UserEntity> {
    const user = this._userRepository.create(createUserDto);
    return queryRunner.manager.save(user);
  }

  public async getUser(uuid: string): Promise<UserEntity> {
    return this._userRepository.findOne({ uuid });
  }
}
