import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadType } from '../types';

@Injectable()
export class TokenService {
  constructor(private jwt: JwtService) {}

  async generateToken(payload: JwtPayloadType) {
    const access_token = await this.jwt.signAsync(payload);

    return { access_token };
  }
}
