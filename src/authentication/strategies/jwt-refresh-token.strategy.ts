import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { TokenPayload } from '../interfaces';
import { AuthenticationService } from '../services';
import { UserService } from 'src/user/services';
import { UserEntity } from 'src/user/entities';
import { WrongCredentialsProvidedException } from '../exceptions';
import { encodeString } from '../utils';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    private readonly _configService: ConfigService,
    private readonly _userService: UserService,
    private readonly _authenticationService: AuthenticationService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.Refresh;
        },
      ]),
      secretOrKey: _configService.get('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
      ignoreExpiration: false,
    });
  }

  async validate(
    request: Request,
    { uuid }: TokenPayload,
  ): Promise<UserEntity> {
    const refreshToken = request.cookies?.Refresh;
    const encodedRefreshToken = encodeString(refreshToken);
    const user = await this._userService.getUser(uuid);

    if (!user) {
      /**
       * the same exception is given to protect the controller from API attacks
       */
      throw new WrongCredentialsProvidedException();
    }

    return this._authenticationService.getUserIfRefreshTokenMatches(
      encodedRefreshToken,
      user,
    );
  }
}
