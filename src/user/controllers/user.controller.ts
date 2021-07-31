import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  EmailConfirmationGuard,
  JwtAccessTokenGuard,
} from 'src/authentication/guards';
import { RequestWithUser } from 'src/authentication/interfaces';

@Controller('User')
export class UserController {
  @UseGuards(EmailConfirmationGuard)
  @UseGuards(JwtAccessTokenGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  public async getUser(@Req() { user }: RequestWithUser) {
    return user;
  }
}
