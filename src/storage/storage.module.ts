import { Module } from '@nestjs/common';
import { MinioService } from './minio/minio.service';

@Module({
  providers: [MinioService],
  exports: [MinioService],
})
export class StorageModule {}
