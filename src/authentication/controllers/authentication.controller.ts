import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MailService } from 'src/mail/services';
import { UserEntity } from 'src/user/entities';
import { RegistrationDto } from '../dtos';
import { AuthenticationEntity } from '../entities';
import {
  JwtAccessTokenGuard,
  JwtConfirmTokenGuard,
  JwtRefreshTokenGuard,
  LocalAuthenticationGuard,
} from '../guards';
import { RequestWithUser } from '../interfaces';
import { AuthenticationService } from '../services';

@Controller('Authentication')
export class AuthenticationController {
  constructor(
    private readonly _authenticationService: AuthenticationService,
    private readonly _mailService: MailService,
  ) {}

  @Post('registration')
  @HttpCode(HttpStatus.OK)
  async registration(
    @Body() registrationDto: RegistrationDto,
  ): Promise<AuthenticationEntity> {
    const authentication = await this._authenticationService.registration(
      registrationDto,
    );

    await this._mailService.sendConfirmationEmail(authentication);

    return authentication;
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

  @UseGuards(JwtAccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('log-out')
  async logout(@Req() request: RequestWithUser): Promise<void> {
    await this._authenticationService.logout(request.user);

    request.res.setHeader(
      'Set-Cookie',
      this._authenticationService.getCookiesForLogout(),
    );
  }

  @UseGuards(JwtRefreshTokenGuard)
  @Get('refresh')
  refresh(@Req() request: RequestWithUser): UserEntity {
    const accessTokenCookie = this._authenticationService.refreshToken(
      request.user,
    );

    request.res.setHeader('Set-Cookie', accessTokenCookie);

    return request.user;
  }

  @UseGuards(JwtConfirmTokenGuard)
  @Patch('confirm')
  async confirm(@Req() request: RequestWithUser): Promise<void> {
    return this._authenticationService.confirm(request.user.authentication);
  }

  @Post('resend-confirmation-link')
  @UseGuards(JwtAccessTokenGuard)
  async resendConfirmationLink(@Req() request: RequestWithUser) {
    await this._authenticationService.resendConfirmationLink(
      request.user.authentication,
    );
  }
}
