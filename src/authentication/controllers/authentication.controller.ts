import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserEntity } from 'src/user/entities';
import { RegistrationDto } from '../dtos';
import { AuthenticationEntity } from '../entities';
import { LocalAuthenticationGuard } from '../guards';
import { JwtAuthenticationGuard } from '../guards';
import { RequestWithUser } from '../interfaces';
import { AuthenticationService } from '../services';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('Authentication')
export class AuthenticationController {
  constructor(private readonly _authenticationService: AuthenticationService) {}

  @Post('registration')
  @HttpCode(HttpStatus.OK)
  async registration(
    @Body() registrationDto: RegistrationDto,
  ): Promise<AuthenticationEntity> {
    return this._authenticationService.registration(registrationDto);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthenticationGuard)
  @Post('log-in')
  async login(@Req() request: RequestWithUser): Promise<UserEntity> {
    const cookie = this._authenticationService.getCookieWithJwtToken(
      request.user.uuid,
    );

    request.res.setHeader('Set-Cookie', cookie);

    return request.user;
  }

  @UseGuards(JwtAuthenticationGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('log-out')
  async logout(@Req() request: RequestWithUser) {
    request.res.setHeader(
      'Set-Cookie',
      this._authenticationService.getCookieForLogout(),
    );
  }
}
