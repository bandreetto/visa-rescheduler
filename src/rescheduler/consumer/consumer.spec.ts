import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { Consumer } from './consumer';

describe('Consumer', () => {
  let configService: ConfigService;
  let emitter: EventEmitter2;
  let consumer: Consumer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), EventEmitterModule.forRoot()],
      providers: [Consumer],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
    emitter = module.get<EventEmitter2>(EventEmitter2);
    consumer = module.get<Consumer>(Consumer);
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });

  it('should try to reschedule when there are earlier dates', () => {});
});
