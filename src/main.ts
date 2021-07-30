import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {  NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = +configService.get<number>('PORT');

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  await app.listen(port);

  return app;
}

void bootstrap();
