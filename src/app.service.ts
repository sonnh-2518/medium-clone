import { Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class AppService {
  constructor(private readonly i18n: I18nService) {}

  getHelloWorld(): { message: string } {
    return {
      message: this.i18n.t('common.hello', {
        lang: I18nContext.current()?.lang,
      }),
    };
  }
}
