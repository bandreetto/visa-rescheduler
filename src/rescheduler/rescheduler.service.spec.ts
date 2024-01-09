import { Test, TestingModule } from '@nestjs/testing';
import { ReschedulerService } from './rescheduler.service';

describe('ReschedulerService', () => {
  let service: ReschedulerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReschedulerService],
    }).compile();

    service = module.get<ReschedulerService>(ReschedulerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
