import { Test, TestingModule } from '@nestjs/testing';
import { ZokratesService } from './zokrates.service';

describe('ZokratesService', () => {
  let service: ZokratesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZokratesService],
    }).compile();

    service = module.get<ZokratesService>(ZokratesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
