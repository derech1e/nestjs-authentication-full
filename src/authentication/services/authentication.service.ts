import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/user/entities';
import { UserService } from 'src/user/services';
import { Connection, QueryRunner } from 'typeorm';
import { CreateAuthenticationDto, RegistrationDto } from '../dtos';
import { AuthenticationEntity } from '../entities';
import { WrongCredentialsProvidedException } from '../exceptions';
import { TokenPayload } from '../interfaces';
import { AuthenticationRepository } from '../repositories';
import { validateHash } from '../utils';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly _authenticationRepository: AuthenticationRepository,
    private readonly _userService: UserService,
    private readonly _connection: Connection,
    private readonly _jwtService: JwtService,
    private readonly _configService: ConfigService,
  ) {}

  public async getAuthenticatedUser(
    emailAddress: string,
    plainTextPassword: string,
  ): Promise<UserEntity> {
    const authentication = await this._getAuthentication(emailAddress);

    if (!authentication) {
      /**
       * the same exception is given to protect the controller from API attacks
       */
      throw new WrongCredentialsProvidedException();
    }

    const isPasswordMatching = await validateHash(
      plainTextPassword,
      authentication.password,
    );

    if (!isPasswordMatching) {
      throw new WrongCredentialsProvidedException();
    }

    return authentication.user;
  }

  public getCookieWithJwtToken(uuid: string): string {
    const payload: TokenPayload = { uuid };
    const token = this._jwtService.sign(payload);
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this._configService.get(
      'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
    )}`;
  }

  public getCookieForLogout(): string {
    return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
  }

  public async registration({
    firstName,
    ...rest
  }: RegistrationDto): Promise<AuthenticationEntity> {
    const queryRunner = this._connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this._userService.createUser(
        { firstName },
        queryRunner,
      );

      const authentication = await this._createAuthentication(
        rest,
        user,
        queryRunner,
      );
      await queryRunner.commitTransaction();

      return authentication;
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
    return this._authenticationRepository.findOne(
      { emailAddress },
      /*
       * User Entity will always join relationships with Authentication Entity,
       * but there's no need to do it the other way around (we use { eager: true } in UserEntity file).
       *
       * However, this function is used in LocalStrategy and we need to return the user's uuid.
       * Therefore, we need to rigidly add a relation to the user.
       *
       * This will allow us to add a user model with authorization to each request, not the authorization model itself.
       */
      { relations: ['user'] },
    );
  }
}
