import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, Min } from 'class-validator';

export class paginationDTO {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit: number;
}
