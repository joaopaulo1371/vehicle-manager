import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getStatus() {
    return {
      ok: true,
      service: 'vehicle-manager-api',
      timestamp: new Date().toISOString(),
    };
  }
}
