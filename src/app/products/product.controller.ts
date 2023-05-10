import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto';
import { JwtGuard } from '../auth/guards';
import { User } from '../auth/decorators';
import { JwtUserType } from '../auth/types';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtGuard)
  async createProduct(
    @Body() dto: CreateProductDto,
    @User() merchant: JwtUserType,
  ) {
    const data = await this.productService.createProduct(dto, merchant);

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
}
