import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { User } from '../auth/decorators';
import { JwtGuard } from '../auth/guards';
import { JwtUserType } from '../auth/types';
import { CreateProductDto } from './dto';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtGuard)
  @UseInterceptors(FilesInterceptor('images'))
  async createProduct(
    @Body() dto: CreateProductDto,
    @User() merchant: JwtUserType,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: '.(jpg|jpeg|png)',
        })
        .addMaxSizeValidator({
          maxSize: 1024 * 1024 * 3, // 3 MB
        })
        .build({
          fileIsRequired: false,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
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
}
