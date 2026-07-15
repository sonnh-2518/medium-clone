import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as i18nUtil from './common/utils/i18n.util';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    jest.spyOn(i18nUtil, 't').mockReturnValue('Hello World!');

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('hello', () => {
    it('should return { message: "Hello World!" }', () => {
      expect(appController.getHelloWorld()).toEqual({
        message: 'Hello World!',
      });
    });
  });
});
