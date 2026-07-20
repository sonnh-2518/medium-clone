import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateArticleDto {
  @ApiPropertyOptional({ example: 'Did you train your dragon?' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('common.validation.IS_STRING') })
  @IsNotEmpty({
    message: i18nValidationMessage('common.validation.IS_NOT_EMPTY'),
  })
  @MaxLength(255, {
    message: i18nValidationMessage('common.validation.MAX_LENGTH'),
  })
  title?: string;

  @ApiPropertyOptional({ example: 'So toothless' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('common.validation.IS_STRING') })
  @IsNotEmpty({
    message: i18nValidationMessage('common.validation.IS_NOT_EMPTY'),
  })
  @MaxLength(500, {
    message: i18nValidationMessage('common.validation.MAX_LENGTH'),
  })
  description?: string;

  @ApiPropertyOptional({ example: 'It takes a Jacobian' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('common.validation.IS_STRING') })
  @IsNotEmpty({
    message: i18nValidationMessage('common.validation.IS_NOT_EMPTY'),
  })
  body?: string;

  @ApiPropertyOptional({ example: ['dragons'], type: [String] })
  @IsOptional()
  @IsArray({ message: i18nValidationMessage('common.validation.IS_ARRAY') })
  @ArrayUnique({
    message: i18nValidationMessage('common.validation.ARRAY_UNIQUE'),
  })
  @IsString({
    each: true,
    message: i18nValidationMessage('common.validation.IS_STRING'),
  })
  @IsNotEmpty({
    each: true,
    message: i18nValidationMessage('common.validation.IS_NOT_EMPTY'),
  })
  tagList?: string[];
}
