import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
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
import JwtRefreshGuard from '../guards/jwt-refresh.guard';
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
    const [accessTokenCookie, refreshTokenCookie] =
      await this._authenticationService.login(request.user);

    request.res.setHeader('Set-Cookie', [
      accessTokenCookie,
      refreshTokenCookie,
    ]);

    return request.user;
  }

  @UseGuards(JwtAuthenticationGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('log-out')
  async logout(@Req() request: RequestWithUser): Promise<void> {
    await this._authenticationService.logout(request.user);

    request.res.setHeader(
      'Set-Cookie',
      this._authenticationService.getCookiesForLogout(),
    );
  }

  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  refresh(@Req() request: RequestWithUser): UserEntity {
    const accessTokenCookie = this._authenticationService.refreshToken(
      request.user,
    );

    request.res.setHeader('Set-Cookie', accessTokenCookie);

    return request.user;
  }
}
