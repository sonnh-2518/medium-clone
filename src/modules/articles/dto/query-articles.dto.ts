import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class QueryArticlesDto {
  @ApiPropertyOptional({ example: 'dragons', description: 'Filter by tag' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  tag?: string;

  @ApiPropertyOptional({
    example: 'jake',
    description: 'Filter by author username',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  author?: string;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ default: 0, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}
