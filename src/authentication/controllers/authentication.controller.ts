import {
  Body,
  Controller,
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
  ): Promise<UserEntity> {
    const user = await this._authenticationService.registration(
      registrationDto,
    );

    await this._mailService.sendConfirmationEmail(user.authentication);

    return user;
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
  @Patch('log-out')
  async logout(@Req() request: RequestWithUser): Promise<void> {
    await this._authenticationService.logout(request.user);

    request.res.setHeader(
      'Set-Cookie',
      this._authenticationService.getCookiesForLogout(),
    );
  }

  @UseGuards(JwtRefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Get('refresh')
  refresh(@Req() request: RequestWithUser): void {
    const accessTokenCookie = this._authenticationService.refreshToken(
      request.user,
    );

    request.res.setHeader('Set-Cookie', accessTokenCookie);
  }

  @UseGuards(JwtConfirmTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('confirm')
  async confirm(@Req() { user }: RequestWithUser): Promise<void> {
    return this._authenticationService.confirm(user.authentication);
  }

  @Post('confirm/resend')
  @UseGuards(JwtAccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendConfirmationLink(@Req() { user }: RequestWithUser) {
    await this._authenticationService.resendConfirmationLink(
      user.authentication,
    );
  }
}
