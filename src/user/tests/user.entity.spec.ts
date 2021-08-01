import { AuthenticationEntity } from 'src/authentication/entities';
import { UserEntity } from '../entities';

describe('UserEntity class', () => {
  it('should make a user with no fields', () => {
    const user = new UserEntity();

    expect(user).toBeTruthy();
    expect(user.firstName).toBe('');
    expect(user.authentication).toBe(undefined);
  });

  it('should make a user with firstName only', () => {
    const cat = new UserEntity('Adrian');

    expect(cat).toBeTruthy();
    expect(cat.firstName).toBe('Adrian');
    expect(cat.authentication).toBe(undefined);
  });

  it('should make a user with firstName and relation', () => {
    const authentication = new AuthenticationEntity();
    const cat = new UserEntity('Adrian', authentication);

    expect(cat).toBeTruthy();
    expect(cat.firstName).toBe('Adrian');
    expect(cat.authentication).toBe(authentication);
  });
});
