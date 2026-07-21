import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class QueryCommentsDto {
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
