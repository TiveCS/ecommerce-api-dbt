import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { RegisterDto } from './dto';
import { AuthType } from './types';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

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

    if (user) {
      throw new ForbiddenException('Account already exists');
    }

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
}
