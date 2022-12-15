import { Test, TestingModule } from '@nestjs/testing';
import { RegistryController } from './registry.controller';
import { RegistryService } from './registry.service';

describe('RegistryController', () => {
  let controller: RegistryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistryController],
      providers: [RegistryService],
    }).compile();

    controller = module.get<RegistryController>(RegistryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
