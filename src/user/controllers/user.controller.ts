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
  /**
   * Decorators resolve from bottom to top.
   * In our implementation, the EmailConfirmationGuard requires the request.user object to work properly.
   */
  @UseGuards(EmailConfirmationGuard)
  @UseGuards(JwtAccessTokenGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  public async getUser(@Req() { user }: RequestWithUser) {
    return user;
  }
}
