import { AuthenticationEntity } from 'src/authentication/entities';
import { UserEntity } from 'src/user/entities';
import { RoleType } from '../constants';

describe('AuthenticationEntity class', () => {
  it('should make a authentication with no fields', () => {
    const authentication = new AuthenticationEntity();

    expect(authentication.role).toBe(RoleType.USER);
    expect(authentication.emailAddress).toBe('');
    expect(authentication.password).toBe('');
    expect(authentication.isEmailConfirmed).toBe(false);
    expect(authentication.currentHashedRefreshToken).toBe('');
    expect(authentication.user).toBe(undefined);
  });

  it('should make a authentication with role only', () => {
    const authentication = new AuthenticationEntity(RoleType.SUSPENSION);

    expect(authentication).toBeTruthy();
    expect(authentication.role).toBe(RoleType.SUSPENSION);
    expect(authentication.emailAddress).toBe('');
    expect(authentication.password).toBe('');
    expect(authentication.isEmailConfirmed).toBe(false);
    expect(authentication.currentHashedRefreshToken).toBe('');
    expect(authentication.user).toBe(undefined);
  });

  it('should make a authentication with role and emailAddress only', () => {
    const authentication = new AuthenticationEntity(RoleType.SUSPENSION, 'test@test.com');

    expect(authentication).toBeTruthy();
    expect(authentication.role).toBe(RoleType.SUSPENSION);
    expect(authentication.emailAddress).toBe('test@test.com');
    expect(authentication.password).toBe('');
    expect(authentication.isEmailConfirmed).toBe(false);
    expect(authentication.currentHashedRefreshToken).toBe('');
    expect(authentication.user).toBe(undefined);
  });

  it('should make a authentication with role, emailAddress, password only', () => {
    const authentication = new AuthenticationEntity(RoleType.SUSPENSION, 'test@test.com', '123456');

    expect(authentication).toBeTruthy();
    expect(authentication.role).toBe(RoleType.SUSPENSION);
    expect(authentication.emailAddress).toBe('test@test.com');
    expect(authentication.password).toBe('123456');
    expect(authentication.isEmailConfirmed).toBe(false);
    expect(authentication.currentHashedRefreshToken).toBe('');
    expect(authentication.user).toBe(undefined);
  });

  it('should make a authentication with role, emailAddress, password, isEmailConfirmed only', () => {
    const authentication = new AuthenticationEntity(
      RoleType.SUSPENSION,
      'test@test.com',
      '123456',
      true,
    );

    expect(authentication).toBeTruthy();
    expect(authentication.role).toBe(RoleType.SUSPENSION);
    expect(authentication.emailAddress).toBe('test@test.com');
    expect(authentication.password).toBe('123456');
    expect(authentication.isEmailConfirmed).toBe(true);
    expect(authentication.currentHashedRefreshToken).toBe('');
    expect(authentication.user).toBe(undefined);
  });

  it('should make a authentication with role, emailAddress, password, isEmailConfirmed, currentHashedRefreshToken only', () => {
    const authentication = new AuthenticationEntity(
      RoleType.SUSPENSION,
      'test@test.com',
      '123456',
      true,
      'abc123zxc',
    );

    expect(authentication).toBeTruthy();
    expect(authentication.role).toBe(RoleType.SUSPENSION);
    expect(authentication.emailAddress).toBe('test@test.com');
    expect(authentication.password).toBe('123456');
    expect(authentication.isEmailConfirmed).toBe(true);
    expect(authentication.currentHashedRefreshToken).toBe('abc123zxc');
    expect(authentication.user).toBe(undefined);
  });

  it('should make a authentication with role, emailAddress, password, isEmailConfirmed, currentHashedRefreshToken and user', () => {
    const user = new UserEntity();
    const authentication = new AuthenticationEntity(
      RoleType.SUSPENSION,
      'test@test.com',
      '123456',
      true,
      'abc123zxc',
      user,
    );

    expect(authentication).toBeTruthy();
    expect(authentication.role).toBe(RoleType.SUSPENSION);
    expect(authentication.emailAddress).toBe('test@test.com');
    expect(authentication.password).toBe('123456');
    expect(authentication.isEmailConfirmed).toBe(true);
    expect(authentication.currentHashedRefreshToken).toBe('abc123zxc');
    expect(authentication.user).toBe(user);
  });
});
