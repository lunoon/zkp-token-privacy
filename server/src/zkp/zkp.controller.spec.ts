import { Test, TestingModule } from '@nestjs/testing';
import { ZkpController } from './zkp.controller';
import { ZkpService } from './zkp.service';

describe('ZkpController', () => {
  let controller: ZkpController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZkpController],
      providers: [ZkpService],
    }).compile();

    controller = module.get<ZkpController>(ZkpController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
