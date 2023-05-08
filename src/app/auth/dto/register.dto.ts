import { IsEmail, IsEnum, IsString } from 'class-validator';
import { AuthType } from '../types';

export class RegisterDto {
  @IsString()
  name: string;

  @IsString()
  password: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsEnum(AuthType)
  authType: AuthType;
}
