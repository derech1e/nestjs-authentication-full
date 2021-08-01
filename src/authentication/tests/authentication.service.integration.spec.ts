import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { AuthenticationService } from '../services';
import { UserService } from 'src/user/services';
import {
  ConnectionMock,
  mockedConfigService,
  mockedJwtService,
} from 'src/utils/mocks';
import { UserRepository } from 'src/user/repositories';
import { AuthenticationRepository } from '../repositories';
import { AuthenticationEntity } from '../entities';
import { MailService } from 'src/mail/services';
import { BullModule } from '@nestjs/bull';
import { MAIL_QUEUE } from 'src/mail/constants';
import { Connection } from 'typeorm';
import { RoleType } from '../constants';

jest.mock('bcrypt');

describe('The AuthenticationService', () => {
  let module: TestingModule;
  let authenticationService: AuthenticationService;
  let bcryptCompare: jest.Mock;
  let authentication: AuthenticationEntity;
  let findAuthentication: jest.Mock;

  beforeEach(async () => {
    authentication = new AuthenticationEntity(
      RoleType.USER,
      'user@email.com',
      'strongPassword',
    );
    findAuthentication = jest.fn().mockResolvedValue(authentication);

    const authenticationRepository = {
      findOne: findAuthentication,
    };

    bcryptCompare = jest.fn().mockReturnValue(true);
    (bcrypt.compare as jest.Mock) = bcryptCompare;

    module = await Test.createTestingModule({
      imports: [BullModule.registerQueue({ name: MAIL_QUEUE })],
      providers: [
        UserService,
        AuthenticationService,
        MailService,
        {
          provide: ConfigService,
          useValue: mockedConfigService,
        },
        {
          provide: JwtService,
          useValue: mockedJwtService,
        },
        {
          provide: getRepositoryToken(AuthenticationRepository),
          useValue: authenticationRepository,
        },
        {
          provide: getRepositoryToken(UserRepository),
          useValue: {},
        },
        {
          provide: Connection,
          useClass: ConnectionMock,
        },
      ],
    }).compile();

    authenticationService = await module.get(AuthenticationService);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('when accessing the data of authenticating user', () => {
    it('should attempt to get a user by email', async () => {
      const getAuthentication = jest.spyOn(
        authenticationService,
        'getAuthentication',
      );

      await authenticationService.getAuthenticatedUser(
        'user@email.com',
        'strongPassword',
      );
      expect(getAuthentication).toBeCalledTimes(1);
    });

    describe('and the provided password is not valid', () => {
      beforeEach(() => {
        bcryptCompare.mockReturnValue(false);
      });

      it('should throw an error', async () => {
        await expect(
          authenticationService.getAuthenticatedUser(
            'user@email.com',
            'strongPassword',
          ),
        ).rejects.toThrow();
      });
    });

    describe('and the provided password is valid', () => {
      beforeEach(() => {
        bcryptCompare.mockReturnValue(true);
      });

      // todo
      // describe('and the user is found in the database', () => {
      //   beforeEach(() => {
      //     findAuthentication.mockResolvedValue(authentication);
      //   });

      //   it('should return the user data', async () => {
      //     const user = await authenticationService.getAuthenticatedUser(
      //       'user@email.com',
      //       'strongPassword',
      //     );

      //     expect(user).toBe(authentication);
      //   });
      // });

      describe('and the user is not found in the database', () => {
        beforeEach(() => {
          findAuthentication.mockResolvedValue(undefined);
        });

        it('should throw an error', async () => {
          await expect(
            authenticationService.getAuthenticatedUser(
              'user@email.com',
              'strongPassword',
            ),
          ).rejects.toThrow();
        });
      });
    });
  });
});
