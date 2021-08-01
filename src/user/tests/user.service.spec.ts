import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../entities';
import { UserRepository } from '../repositories';
import { UserService } from '../services';

describe('The UserService', () => {
  let module: TestingModule;
  let userService: UserService;
  let findOne: jest.Mock;

  beforeEach(async () => {
    findOne = jest.fn();

    module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserRepository),
          useValue: {
            findOne,
          },
        },
      ],
    }).compile();

    userService = await module.get(UserService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('when getting a user by uuid', () => {
    describe('and the user is matched', () => {
      let user: UserEntity;

      beforeEach(() => {
        user = new UserEntity('Adrian');

        findOne.mockReturnValue(Promise.resolve(user));
      });

      it('should return the user', async () => {
        const fetchedUser = await userService.getUser('12345-1234');

        expect(fetchedUser).toEqual(user);
      });
    });

    describe('and the user is not matched', () => {
      beforeEach(() => {
        findOne.mockReturnValue(undefined);
      });

      it('should undefined', async () => {
        const user = await userService.getUser('uuid');
        expect(user).toEqual(undefined);
      });
    });
  });
});
