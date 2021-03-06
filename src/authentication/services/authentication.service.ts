import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PostgresErrorCode } from 'src/database/constraints';
import { MailService } from 'src/mail/services';
import { UserEntity } from 'src/user/entities';
import { UserService } from 'src/user/services';
import { Connection, QueryRunner } from 'typeorm';
import { CreateAuthenticationDto, RegistrationDto } from '../dtos';
import { AuthenticationEntity } from '../entities';
import {
  RefreshTokenNoMatchingException,
  WrongCredentialsProvidedException,
} from '../exceptions';
import { TokenPayload, VerificationTokenPayload } from '../interfaces';
import { AuthenticationRepository } from '../repositories';
import { validateHash } from '../utils';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly _authenticationRepository: AuthenticationRepository,
    private readonly _userService: UserService,
    @Inject(forwardRef(() => MailService))
    private readonly _mailService: MailService,
    private readonly _connection: Connection,
    private readonly _jwtService: JwtService,
    private readonly _configService: ConfigService,
  ) {}

  public async login(user: UserEntity): Promise<string[]> {
    const accessTokenCookie = this._getCookieWithJwtAccessToken(user.uuid);
    const { cookie: refreshTokenCookie, token: refreshToken } =
      this._getCookieWithJwtRefreshToken(user.uuid);

    await this._setCurrentRefreshToken(user.authentication.id, refreshToken);

    return [accessTokenCookie, refreshTokenCookie];
  }

  public async logout(user: UserEntity): Promise<void> {
    await this._removeRefreshToken(user.authentication.id);
  }

  public refreshToken(user: UserEntity): string {
    return this._getCookieWithJwtAccessToken(user.uuid);
  }

  public async confirm(authentication: AuthenticationEntity) {
    await this._markEmailAsConfirmed(authentication.emailAddress);
  }

  public async getAuthenticatedUser(
    emailAddress: string,
    plainTextPassword: string,
  ): Promise<UserEntity> {
    const authentication = await this.getAuthentication(emailAddress);

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

  public getCookiesForLogout(): string[] {
    return [
      'Authentication=; HttpOnly; Path=/; Max-Age=0',
      'Refresh=; HttpOnly; Path=/; Max-Age=0',
    ];
  }

  public async getUserIfRefreshTokenMatches(
    refreshToken: string,
    user: UserEntity,
  ) {
    const isRefreshTokenMatching = await validateHash(
      refreshToken,
      user.authentication.currentHashedRefreshToken,
    );

    if (!isRefreshTokenMatching) {
      throw new RefreshTokenNoMatchingException();
    }

    return user;
  }

  public getJwtConfirmToken(emailAddress: string): string {
    const payload: VerificationTokenPayload = { emailAddress };
    const token = this._jwtService.sign(payload, {
      secret: this._configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
      expiresIn: `${this._configService.get(
        'JWT_VERIFICATION_TOKEN_EXPIRATION_TIME',
      )}s`,
    });

    return token;
  }

  public async resendConfirmationLink(
    authentication: AuthenticationEntity,
  ): Promise<void> {
    if (authentication.isEmailConfirmed) {
      throw new BadRequestException('Email already confirmed');
    }

    await this._mailService.sendConfirmationEmail(authentication);
  }

  public async registration({
    firstName,
    ...rest
  }: RegistrationDto): Promise<UserEntity> {
    const queryRunner = this._connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const authentication = await this._createAuthentication(
        rest,
        queryRunner,
      );

      const user = await this._userService.createUser(
        { firstName },
        authentication,
        queryRunner,
      );
   
      await queryRunner.commitTransaction();

      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new BadRequestException('User with that email already exists');
      }

      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  public async getAuthentication(
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

  private async _removeRefreshToken(authenticationId: number) {
    return this._authenticationRepository.update(authenticationId, {
      currentHashedRefreshToken: null,
    });
  }

  private _getCookieWithJwtAccessToken(uuid: string): string {
    const payload: TokenPayload = { uuid };
    const token = this._jwtService.sign(payload, {
      secret: this._configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this._configService.get(
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      )}s`,
    });

    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this._configService.get(
      'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
    )}`;
  }

  private _getCookieWithJwtRefreshToken(uuid: string) {
    const payload: TokenPayload = { uuid };
    const token = this._jwtService.sign(payload, {
      secret: this._configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this._configService.get(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      )}s`,
    });
    const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this._configService.get(
      'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
    )}`;

    return { cookie, token };
  }

  private async _setCurrentRefreshToken(
    authenticationId: number,
    currentHashedRefreshToken: string,
  ) {
    return this._authenticationRepository.update(authenticationId, {
      currentHashedRefreshToken,
    });
  }

  private async _markEmailAsConfirmed(emailAddress: string) {
    return this._authenticationRepository.update(
      { emailAddress },
      { isEmailConfirmed: true },
    );
  }

  private async _createAuthentication(
    createAuthenticationDto: CreateAuthenticationDto,
    queryRunner: QueryRunner,
  ): Promise<AuthenticationEntity> {
    const authentication = this._authenticationRepository.create(
      createAuthenticationDto,
    );

    return queryRunner.manager.save(authentication);
  }
}
