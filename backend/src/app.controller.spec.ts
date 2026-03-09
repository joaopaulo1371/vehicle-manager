import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return app status', () => {
      const response = appController.getStatus();
      expect(response.ok).toBe(true);
      expect(response.service).toBe('vehicle-manager-api');
    });
  });
});
