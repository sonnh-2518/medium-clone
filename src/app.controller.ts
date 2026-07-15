import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  getHelloWorld(): { message: string } {
    return this.appService.getHelloWorld();
  }
}
