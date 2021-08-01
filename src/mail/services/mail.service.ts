import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { CONFIRM_REGISTRATION, MAIL_QUEUE } from '../constants';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { AuthenticationService } from 'src/authentication/services';
import { ConfigService } from '@nestjs/config';
import { AuthenticationEntity } from 'src/authentication/entities';

@Injectable()
export class MailService {
  private readonly _logger = new Logger(MailService.name);

  constructor(
    @InjectQueue(MAIL_QUEUE) private readonly _mailQueue: Queue,
    private readonly _configService: ConfigService,
    @Inject(forwardRef(() => AuthenticationService))
    private readonly _authenticationService: AuthenticationService,
  ) {}

  public async sendConfirmationEmail(
    authentication: AuthenticationEntity,
  ): Promise<void> {
    const confirmUrl = this.getConfirmUrl(authentication.emailAddress);

    try {
      await this._mailQueue.add(CONFIRM_REGISTRATION, {
        authentication,
        confirmUrl,
      });
    } catch (error) {
      this._logger.error(
        `Error queueing registration email to user ${authentication.emailAddress}`,
      );

      throw error;
    }
  }

  private getConfirmUrl(emailAddress: string): string {
    const token = this._authenticationService.getJwtConfirmToken(emailAddress);

    return `${this._configService.get(
      'EMAIL_CONFIRMATION_URL',
    )}?token=${token}`;
  }
}
