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
import { i18nValidationMessage } from 'nestjs-i18n';

export class QueryArticlesDto {
  @ApiPropertyOptional({ example: 'dragons', description: 'Filter by tag' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('common.validation.IS_STRING') })
  @IsNotEmpty({
    message: i18nValidationMessage('common.validation.IS_NOT_EMPTY'),
  })
  tag?: string;

  @ApiPropertyOptional({
    example: 'jake',
    description: 'Filter by author username',
  })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('common.validation.IS_STRING') })
  @IsNotEmpty({
    message: i18nValidationMessage('common.validation.IS_NOT_EMPTY'),
  })
  author?: string;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('common.validation.IS_INT') })
  @Min(1, { message: i18nValidationMessage('common.validation.MIN') })
  @Max(100, { message: i18nValidationMessage('common.validation.MAX') })
  limit?: number = 20;

  @ApiPropertyOptional({ default: 0, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('common.validation.IS_INT') })
  @Min(0, { message: i18nValidationMessage('common.validation.MIN') })
  offset?: number = 0;
}
