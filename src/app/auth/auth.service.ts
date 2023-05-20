import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { LoginDto, RegisterDto } from './dto';
import { AuthType } from './types';
import * as argon2 from 'argon2';
import { TokenService } from './jwt/token.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
  ) {}

  async register(dto: RegisterDto) {
    const { email, name, password, phone, authType } = dto;

    const user = await this.prisma.userIdentity.findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
      },
    });

    if (user) throw new ForbiddenException('Account already exists');

    const hashedPassword = await argon2.hash(password);

    switch (authType) {
      case AuthType.Customer:
        return await this.prisma.customer.create({
          data: {
            identity: {
              create: {
                email: email,
                password: hashedPassword,
                name: name,
                phone: phone,
              },
            },
          },
          select: {
            id: true,
          },
        });
        break;
      case AuthType.Merchant:
        return await this.prisma.merchant.create({
          data: {
            identity: {
              create: {
                email: email,
                password: hashedPassword,
                name: name,
                phone: phone,
              },
            },
          },
          select: {
            id: true,
          },
        });
        break;
    }
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;

    const identity = await this.prisma.userIdentity.findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
        password: true,
        merchant: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!identity) throw new ForbiddenException('Invalid credentials');

    const isPasswordValid = await argon2.verify(identity.password, password);

    if (!isPasswordValid) throw new ForbiddenException('Invalid credentials');

    const isMerchant = identity.merchant ? true : false;

    const token = await this.tokenService.generateToken({
      sub: identity.id,
      role: isMerchant ? 'merchant' : 'customer',
    });

    this.sayTest();
    this.sayTest();
    this.sayTest();
    this.sayTest();

    return token;
  }

  sayTest() {
    console.log('test');
  }
}
