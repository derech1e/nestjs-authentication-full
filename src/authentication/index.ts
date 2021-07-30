import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user';
import { AuthenticationController } from './controllers';
import { AuthenticationRepository } from './repositories';
import { AuthenticationService } from './services';
import {
  JwtAccessTokenStrategy,
  JwtRefreshTokenStrategy,
  LocalStrategy,
} from './strategies';

@Module({
  imports: [
    UserModule,
    PassportModule,
    ConfigModule,
    TypeOrmModule.forFeature([AuthenticationRepository]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: `${configService.get(
            'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
          )}s`,
        },
      }),
    }),
  ],
  providers: [
    AuthenticationService,
    LocalStrategy,
    JwtAccessTokenStrategy,
    JwtRefreshTokenStrategy,
  ],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
