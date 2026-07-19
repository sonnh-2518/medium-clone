import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateArticleDto {
  @ApiPropertyOptional({ example: 'Did you train your dragon?' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ example: 'So toothless' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 'It takes a Jacobian' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  body?: string;

  @ApiPropertyOptional({ example: ['dragons'], type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  tagList?: string[];
}
