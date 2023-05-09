import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './app/auth/auth.module';
import { StorageModule } from './storage/storage.module';
import { ProductModule } from './app/products/product.module';

@Module({
  imports: [
    PrismaModule,
    StorageModule,
    AuthModule,
    ProductModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
})
export class AppModule {}
