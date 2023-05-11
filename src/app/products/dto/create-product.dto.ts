import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  title: string;

  @IsInt()
  @Type(() => Number)
  @Min(1)
  price: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  initialStock?: number;
}
