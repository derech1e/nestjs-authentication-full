import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RoleType } from '../constants';
import {
  EmailConfirmationGuard,
  JwtAccessTokenGuard,
  RolesGuard,
} from '../guards';

export function Authorization(...roles: RoleType[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(JwtAccessTokenGuard, RolesGuard, EmailConfirmationGuard),
  );
}
