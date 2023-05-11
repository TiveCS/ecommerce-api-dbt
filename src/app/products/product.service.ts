import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateProductDto } from './dto';
import { JwtUserType } from '../auth/types';
import { MinioService } from 'src/storage/minio/minio.service';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private minio: MinioService,
    private config: ConfigService,
  ) {}

  async createProduct(
    dto: CreateProductDto,
    merchant: JwtUserType,
    images?: Express.Multer.File[],
  ) {
    const { title, price, description, initialStock } = dto;

    const assetsKeys =
      images && images.length > 0
        ? images.map((image) => `${uuidv4()}_${image.originalname}`)
        : [];

    await Promise.all(
      images.map((image, index) =>
        this.minio.putObject(
          this.config.get('S3_BUCKET'),
          `${assetsKeys[index]}`,
          image.buffer,
        ),
      ),
    );

    return await this.prisma.product.create({
      data: {
        title,
        price,
        description,
        stocks: initialStock,
        merchant: {
          connect: {
            identityId: merchant.identityId,
          },
        },
        assets: {
          create: {
            images: assetsKeys,
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

  async getProductById(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) throw new NotFoundException('Product not found');

    return product;
  }
}
