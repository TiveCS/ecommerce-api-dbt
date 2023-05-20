import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { JwtGuard, MerchantOnlyGuard } from './guards';
import { User } from './decorators';
import { JwtUserType } from './types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const data = await this.authService.register(dto);

    return {
      message: 'Account created successfully',
      status: 'success',
      data: data,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const data = await this.authService.login(dto);

    return {
      message: 'Login successful',
      status: 'success',
      data: data,
    };
  }

  @Get('check')
  @UseGuards(JwtGuard)
  async check(@User() user: JwtUserType) {
    const response = {
      message: 'Token is valid',
      status: 'success',
      data: {
        userId: user.identityId,
      },
    };

    return response;
  }

  @Get('check/merchant')
  @UseGuards(JwtGuard, MerchantOnlyGuard)
  async checkMerchant(@User() user: JwtUserType) {
    const response = {
      message: 'Token is valid',
      status: 'success',
      data: {
        userId: user.identityId,
      },
    };

    return response;
  }
}
