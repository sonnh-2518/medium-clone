import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
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
