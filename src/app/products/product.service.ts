import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { JwtUserType } from '../auth/types';
import { MinioService } from 'src/storage/minio/minio.service';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import {
  GetProductResponse,
  GetProductsModelType,
  GetProductsResponse,
} from './types';

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

  async getProducts(
    name?: string,
    limit?: number,
    cursor?: string,
  ): Promise<GetProductsResponse> {
    const results = await this.prisma.product.findMany({
      where: name
        ? { title: { contains: name }, deletedAt: null }
        : {
            deletedAt: null,
          },
      orderBy: {
        sold: 'desc',
      },
      select: {
        id: true,
        title: true,
        price: true,
        sold: true,
        assets: {
          select: {
            images: true,
          },
        },
      },
      take: limit || 10,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const products: GetProductsResponse = await Promise.all(
      results.map(async (product) => {
        const model: GetProductsModelType = {
          id: product.id,
          title: product.title,
          price: product.price,
          sold: product.sold,
          thumbnailUrl: null,
        };

        if (product.assets.images.length === 0) return model;

        const thumbnailKey = product.assets.images[0];
        const thumbnailUrl = await this.minio.presignedGetObject(
          this.config.get('S3_BUCKET'),
          thumbnailKey,
          60 * 60,
        );

        model.thumbnailUrl = thumbnailUrl;

        return model;
      }),
    );

    return products;
  }

  async getProductById(productId: string): Promise<GetProductResponse> {
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        title: true,
        price: true,
        description: true,
        sold: true,
        stocks: true,
        merchant: {
          select: {
            identity: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
        assets: {
          select: {
            images: true,
          },
        },
        deletedAt: true,
      },
    });

    if (!product) throw new NotFoundException('Product not found');

    if (product.deletedAt)
      throw new NotFoundException('Product has been removed by merchant');

    const assetsUrl: string[] = await Promise.all(
      product.assets.images.map((assetKey) =>
        this.minio.presignedGetObject(
          this.config.get('S3_BUCKET'),
          assetKey,
          60 * 60, // 1 hour
        ),
      ),
    );

    return {
      title: product.title,
      price: product.price,
      description: product.description,
      sold: product.sold,
      stocks: product.stocks,
      merchant: product.merchant.identity,
      images: assetsUrl,
    };
  }

  async deleteProductById(productId: string, merchant: JwtUserType) {
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
        merchant: {
          select: {
            identityId: true,
          },
        },
      },
    });

    if (!product) throw new NotFoundException('Product not found');

    if (product.merchant.identityId !== merchant.identityId)
      throw new ForbiddenException(
        'You are not allowed to delete this product',
      );

    return await this.prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        deletedAt: new Date(),
      },
      select: {
        deletedAt: true,
      },
    });
  }

  async updateProductById(
    productId: string,
    dto: UpdateProductDto,
    merchant: JwtUserType,
    images?: Express.Multer.File[],
  ) {
    const { title, price, description, stocks } = dto;

    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        assets: {
          select: {
            images: true,
          },
        },
        merchant: {
          select: {
            identityId: true,
          },
        },
      },
    });

    if (!product) throw new NotFoundException('Product not found');

    if (product.merchant.identityId !== merchant.identityId)
      throw new ForbiddenException(
        'You are not allowed to update this product',
      );

    const assetsKeys =
      images && images.length > 0
        ? images.map((image) => `${uuidv4()}_${image.originalname}`)
        : [];

    if (assetsKeys.length > 0) {
      await Promise.all([
        this.minio.removeObjects(
          this.config.get('S3_BUCKET'),
          product.assets.images,
        ),

        Promise.all(
          images.map((image, index) =>
            this.minio.putObject(
              this.config.get('S3_BUCKET'),
              `${assetsKeys[index]}`,
              image.buffer,
            ),
          ),
        ),
      ]);
    }

    return this.prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        title,
        price,
        description,
        stocks,
        assets: {
          update: assetsKeys.length > 0 ? { images: assetsKeys } : undefined,
        },
      },
      select: {
        updatedAt: true,
      },
    });
  }
}
