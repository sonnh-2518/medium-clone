import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateArticleDto {
  @ApiProperty({ example: 'How to train your dragon' })
  @IsString({ message: i18nValidationMessage('common.validation.IS_STRING') })
  @IsNotEmpty({
    message: i18nValidationMessage('common.validation.IS_NOT_EMPTY'),
  })
  @MaxLength(255, {
    message: i18nValidationMessage('common.validation.MAX_LENGTH'),
  })
  title: string;

  @ApiProperty({ example: 'Ever wonder how?' })
  @IsString({ message: i18nValidationMessage('common.validation.IS_STRING') })
  @IsNotEmpty({
    message: i18nValidationMessage('common.validation.IS_NOT_EMPTY'),
  })
  @MaxLength(500, {
    message: i18nValidationMessage('common.validation.MAX_LENGTH'),
  })
  description: string;

  @ApiProperty({ example: 'You have to believe' })
  @IsString({ message: i18nValidationMessage('common.validation.IS_STRING') })
  @IsNotEmpty({
    message: i18nValidationMessage('common.validation.IS_NOT_EMPTY'),
  })
  body: string;

  @ApiPropertyOptional({ example: ['dragons', 'training'], type: [String] })
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
