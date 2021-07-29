import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthenticationService } from '../services';
import { AuthenticationEntity } from '../entities';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly _authenticationService: AuthenticationService) {
    super({ usernameField: 'emailAddress', passwordField: 'password' });
  }

  public async validate(
    emailAddress: string,
    password: string,
  ): Promise<AuthenticationEntity> {
    return this._authenticationService.getAuthenticatedUser(
      emailAddress,
      password,
    );
  }
}
