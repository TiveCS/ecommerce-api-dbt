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
import { JwtGuard } from './guards';

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
  async check() {
    return { message: 'Token is valid', status: 'success' };
  }
}
