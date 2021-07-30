import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from './strategies';
import { AuthenticationSubscriber } from 'src/authentication/subscribers';
import { UserSubscriber } from 'src/user/subscribers';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        subscribers: [AuthenticationSubscriber, UserSubscriber],
        namingStrategy: new SnakeNamingStrategy(),
        synchronize: true,
        logging: true,
      }),
    }),
  ],
})
export class DatabaseModule {}