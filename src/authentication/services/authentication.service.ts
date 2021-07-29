import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserEntity } from 'src/user/entities';
import { UserService } from 'src/user/services';
import { UtilService } from 'src/util/services/util.service';
import { Connection, QueryRunner } from 'typeorm';
import { CreateAuthenticationDto, RegistrationDto } from '../dtos';
import { AuthenticationEntity } from '../entities';
import { WrongCredentialsProvidedException } from '../exceptions';
import { AuthenticationRepository } from '../repositories';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly _authenticationRepository: AuthenticationRepository,
    private readonly _userService: UserService,
    private readonly _connection: Connection,
  ) {}

  public async getAuthenticatedUser(
    emailAddress: string,
    plainTextPassword: string,
  ) {
    const authentication = await this._getAuthentication(emailAddress);

    if (!authentication) {
      /**
       * the same exception is given to protect the controller from API attacks
       */
      throw new WrongCredentialsProvidedException();
    }

    const isPasswordMatching = await UtilService.validateHash(
      plainTextPassword,
      authentication.password,
    );

    if (!isPasswordMatching) {
      throw new WrongCredentialsProvidedException();
    }

    return authentication;
  }

  public async registration({
    firstName,
    ...rest
  }: RegistrationDto): Promise<UserEntity> {
    const queryRunner = this._connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this._userService.createUser(
        { firstName },
        queryRunner,
      );

      await this._createAuthentication(rest, user, queryRunner);
      await queryRunner.commitTransaction();

      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  private async _createAuthentication(
    createAuthenticationDto: CreateAuthenticationDto,
    user: UserEntity,
    queryRunner: QueryRunner,
  ): Promise<AuthenticationEntity> {
    const authentication = this._authenticationRepository.create({
      ...createAuthenticationDto,
      user,
    });

    return queryRunner.manager.save(authentication);
  }

  private async _getAuthentication(
    emailAddress: string,
  ): Promise<AuthenticationEntity> {
    return this._authenticationRepository.findOne({ emailAddress });
  }
}
