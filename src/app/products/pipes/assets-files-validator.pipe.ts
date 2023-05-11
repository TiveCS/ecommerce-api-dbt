import {
  FileTypeValidator,
  HttpStatus,
  Injectable,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';

@Injectable()
export class AssetsFilesValidatorPipe extends ParseFilePipe {
  constructor() {
    super({
      fileIsRequired: false,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      validators: [
        new FileTypeValidator({
          fileType: '.(jpg|jpeg|png)',
        }),
        new MaxFileSizeValidator({
          maxSize: 1024 * 1024 * 3, // 3 MB
        }),
      ],
    });
  }
}
