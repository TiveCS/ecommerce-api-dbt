import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [StorageModule],
})
export class ProductModule {}
