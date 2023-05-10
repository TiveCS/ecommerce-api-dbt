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

  async getProducts(name?: string, limit?: number, cursor?: string) {
    return await this.prisma.product.findMany({
      where: name ? { title: { contains: name } } : {},
      orderBy: {
        sold: 'desc',
      },
      select: {
        id: true,
        title: true,
        price: true,
        sold: true,
      },
      take: limit || 10,
      cursor: cursor ? { id: cursor } : undefined,
    });
  }
}
