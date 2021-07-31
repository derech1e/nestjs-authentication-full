import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as morgan from 'morgan';
import * as compression from 'compression';
import * as helmet from 'helmet';
import * as RateLimit from 'express-rate-limit';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);
  const configService = app.get(ConfigService);
  const port = +configService.get<number>('PORT');

  app.use(cookieParser());
  app.use(helmet());
  app.use(RateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
  app.use(compression());
  app.use(bodyParser.json({ limit: '1mb' }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(morgan('combined'));

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  await app.listen(port);

  return app;
}

void bootstrap();
