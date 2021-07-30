import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UserService } from 'src/user/services';
import { TokenPayload } from '../interfaces';
import { UserEntity } from 'src/user/entities';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-access-token',
) {
  constructor(
    private readonly _configService: ConfigService,
    private readonly _userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.Authentication;
        },
      ]),
      secretOrKey: _configService.get('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate({ uuid }: TokenPayload): Promise<UserEntity> {
    return this._userService.getUser(uuid);
  }
}
