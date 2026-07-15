import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: I18nService,
          useValue: { t: jest.fn().mockReturnValue('Hello World!') },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('hello', () => {
    it('should return { message: "Hello World!" }', () => {
      expect(appController.getHelloWorld()).toEqual({
        message: 'Hello World!',
      });
    });
  });
});
