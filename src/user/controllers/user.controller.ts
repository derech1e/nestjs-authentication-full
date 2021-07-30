import {
    ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthenticationGuard } from 'src/authentication/guards';
import { RequestWithUser } from 'src/authentication/interfaces';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('User')
export class UserController {
  @UseGuards(JwtAuthenticationGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  public async getUser(@Req() { user }: RequestWithUser) {
    return user;
  }
}
