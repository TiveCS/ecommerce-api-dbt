import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { User } from '../auth/decorators';
import { JwtGuard, MerchantOnlyGuard } from '../auth/guards';
import { JwtUserType } from '../auth/types';
import { CreateProductDto, UpdateProductDto } from './dto';
import { AssetsFilesValidatorPipe } from './pipes';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtGuard, MerchantOnlyGuard)
  @UseInterceptors(FilesInterceptor('images'))
  async createProduct(
    @Body() dto: CreateProductDto,
    @User() merchant: JwtUserType,
    @UploadedFiles(AssetsFilesValidatorPipe)
    images?: Express.Multer.File[],
  ) {
    const data = await this.productService.createProduct(dto, merchant, images);

    return {
      message: 'Product created successfully',
      status: 'success',
      data,
    };
  }

  @Get()
  async getProducts(
    @Query('name') name?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('cursor') cursor?: string,
  ) {
    const data = await this.productService.getProducts(name, limit, cursor);

    return {
      message: 'Products retrieved successfully',
      status: 'success',
      data,
    };
  }

  @Get(':productId')
  async getProductById(@Param('productId') productId: string) {
    const data = await this.productService.getProductById(productId);

    return {
      message: 'Product retrieved successfully',
      statusL: 'success',
      data,
    };
  }

  @Delete(':productId')
  @UseGuards(JwtGuard, MerchantOnlyGuard)
  async deleteProductById(
    @Param('productId') productId: string,
    @User() merchant: JwtUserType,
  ) {
    await this.productService.deleteProductById(productId, merchant);

    return {
      message: 'Product deleted successfully',
      status: 'success',
    };
  }

  @Put(':productId')
  @UseGuards(JwtGuard, MerchantOnlyGuard)
  @UseInterceptors(FilesInterceptor('images'))
  async updateProductById(
    @Param('productId') productId: string,
    @User() merchant: JwtUserType,
    @Body() dto: UpdateProductDto,
    @UploadedFiles(AssetsFilesValidatorPipe) images?: Express.Multer.File[],
  ) {
    const data = await this.productService.updateProductById(
      productId,
      dto,
      merchant,
      images,
    );

    return {
      message: 'Product updated successfully',
      status: 'success',
      data: data,
    };
  }
}
