import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VerificationTokenPayload } from '../interfaces';
import { AuthenticationService } from '../services';
import { UserEntity } from 'src/user/entities';
import { WrongCredentialsProvidedException } from '../exceptions';

@Injectable()
export class JwtConfirmTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-confirm-token',
) {
  constructor(
    private readonly _configService: ConfigService,
    private readonly _authenticationService: AuthenticationService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: _configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate({
    emailAddress,
  }: VerificationTokenPayload): Promise<UserEntity> {
    const authentication = await this._authenticationService.getAuthentication(
      emailAddress,
    );

    if (!authentication) {
      throw new WrongCredentialsProvidedException();
    }

    if (authentication.isEmailConfirmed) {
      throw new BadRequestException('Email already confirmed');
    }

    return authentication.user;
  }
}
