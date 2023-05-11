import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  stocks: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  price: number;
}
