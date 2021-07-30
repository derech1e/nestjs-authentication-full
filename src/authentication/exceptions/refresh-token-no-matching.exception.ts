import { BadRequestException } from '@nestjs/common';

export class RefreshTokenNoMatchingException extends BadRequestException {
  constructor(error?: string) {
    super('Refresh token no matching', error);
  }
}
