import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthenticationService } from '../services';
import { UserEntity } from 'src/user/entities';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly _authenticationService: AuthenticationService) {
    super({ usernameField: 'emailAddress', passwordField: 'password' });
  }

  public async validate(
    emailAddress: string,
    password: string,
  ): Promise<UserEntity> {
    return this._authenticationService.getAuthenticatedUser(
      emailAddress,
      password,
    );
  }
}
