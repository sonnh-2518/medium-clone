import { Injectable } from '@nestjs/common';
import { t } from './common/utils/i18n.util';

@Injectable()
export class AppService {
  getHelloWorld(): { message: string } {
    return {
      message: t('common.hello'),
    };
  }
}
