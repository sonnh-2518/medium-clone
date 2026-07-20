import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateCommentDto {
  @ApiProperty({ example: 'His name was my name too.' })
  @IsString({ message: i18nValidationMessage('common.validation.IS_STRING') })
  @IsNotEmpty({
    message: i18nValidationMessage('common.validation.IS_NOT_EMPTY'),
  })
  body: string;
}
