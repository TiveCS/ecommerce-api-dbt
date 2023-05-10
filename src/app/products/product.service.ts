import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateProductDto } from './dto';
import { JwtUserType } from '../auth/types';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async createProduct(dto: CreateProductDto, merchant: JwtUserType) {
    const { title, price, description, initialStock } = dto;

    return await this.prisma.product.create({
      data: {
        title,
        price,
        description,
        stocks: initialStock,
        assets: {
          create: {},
        },
        merchant: {
          connect: {
            identityId: merchant.identityId,
          },
        },
      },
      select: {
        id: true,
        createdAt: true,
      },
    });
  }
}
