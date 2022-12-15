import { Test, TestingModule } from '@nestjs/testing';
import { ZkpService } from './zkp.service';

describe('ZkpService', () => {
  let service: ZkpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZkpService],
    }).compile();

    service = module.get<ZkpService>(ZkpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
