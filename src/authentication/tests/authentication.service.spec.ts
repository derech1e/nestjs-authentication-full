import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MAIL_QUEUE } from 'src/mail/constants';
import { MailService } from 'src/mail/services';
import { UserRepository } from 'src/user/repositories';
import { UserService } from 'src/user/services';
import {
  ConnectionMock,
  mockedConfigService,
  mockedJwtService,
} from 'src/utils/mocks';
import { Connection } from 'typeorm';
import { RoleType } from '../constants';
import { AuthenticationEntity } from '../entities';
import { AuthenticationRepository } from '../repositories';
import { AuthenticationService } from '../services';

describe('The AuthenticationService', () => {
  let module: TestingModule;
  let authenticationService: AuthenticationService;
  let findOne: jest.Mock;

  beforeEach(async () => {
    findOne = jest.fn();

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
          useValue: {
            findOne,
          },
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

  it('should be defined', () => {
    expect(authenticationService).toBeDefined();
  });

  describe('when getting a authentication by email', () => {
    describe('and the user is matched', () => {
      let authentication: AuthenticationEntity;

      beforeEach(() => {
        authentication = new AuthenticationEntity(
          RoleType.USER,
          'test@test.com',
        );

        findOne.mockReturnValue(Promise.resolve(authentication));
      });

      it('should return the user', async () => {
        const fetchedAuthentication =
          await authenticationService.getAuthentication('test@test.com');

        expect(fetchedAuthentication).toEqual(authentication);
      });
    });

    describe('and the user is not matched', () => {
      beforeEach(() => {
        findOne.mockReturnValue(undefined);
      });

      it('should undefined', async () => {
        const user = await authenticationService.getAuthentication(
          'test@test2.test',
        );
        expect(user).toEqual(undefined);
      });
    });
  });

  describe('when creating a cookie', () => {
    it('should return a string', () => {
      const emailAddress = 'test@test.com';

      expect(
        typeof authenticationService.getJwtConfirmToken(emailAddress),
      ).toEqual('string');
    });
  });

  describe('when removing a cookie', () => {
    it('should return a object', () => {
      expect(typeof authenticationService.getCookiesForLogout()).toEqual(
        'object',
      );
    });
  });
});
