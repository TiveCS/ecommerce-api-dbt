import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService extends Minio.Client {
  constructor(private config: ConfigService) {
    super({
      accessKey: config.get('S3_ACCESS_KEY'),
      secretKey: config.get('S3_SECRET_KEY'),
      endPoint: config.get('S3_ENDPOINT'),
    });
  }
}
