import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService extends Minio.Client {
  private readonly bucketName: string;

  constructor(private config: ConfigService) {
    super({
      accessKey: config.get('S3_ACCESS_KEY'),
      secretKey: config.get('S3_SECRET_KEY'),
      endPoint: config.get('S3_ENDPOINT'),
    });

    this.bucketName = this.config.get<string>('S3_BUCKET');
  }

  async putManyObjects(keys: string[], files: Express.Multer.File[]) {
    return Promise.all(
      files.map((file, index) =>
        this.putObject(this.bucketName, keys[index], file.buffer),
      ),
    );
  }

  async removeManyObjects(keys: string[]) {
    return this.removeObjects(this.bucketName, keys);
  }

  async presignedGetManyObjects(keys: string[], expiry?: number) {
    return Promise.all(
      keys.map((key) => this.presignedGetObject(this.bucketName, key, expiry)),
    );
  }
}
