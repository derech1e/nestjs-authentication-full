import { IntersectionType } from '@nestjs/mapped-types';
import { CreateUserDto } from 'src/user/dtos';
import { CreateAuthenticationDto } from './create-authentication.dto';

export class RegistrationDto extends IntersectionType(
  CreateAuthenticationDto,
  CreateUserDto,
) {}
