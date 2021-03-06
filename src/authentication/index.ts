import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from 'src/mail';
import { UserModule } from 'src/user';
import { AuthenticationController } from './controllers';
import { AuthenticationRepository } from './repositories';
import { AuthenticationService } from './services';
import {
  JwtAccessTokenStrategy,
  JwtConfirmTokenStrategy,
  JwtRefreshTokenStrategy,
  LocalStrategy,
} from './strategies';

@Module({
  imports: [
    UserModule,
    PassportModule,
    ConfigModule,
    forwardRef(() => MailModule),
    TypeOrmModule.forFeature([AuthenticationRepository]),
    JwtModule.register({}),
  ],
  providers: [
    AuthenticationService,
    LocalStrategy,
    JwtAccessTokenStrategy,
    JwtRefreshTokenStrategy,
    JwtConfirmTokenStrategy,
    {
      provide: 'MAIL_SERVICE',
      useFactory: () =>
        ClientProxyFactory.create({
          transport: Transport.TCP,
        }),
    },
  ],
  exports: [AuthenticationService],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
