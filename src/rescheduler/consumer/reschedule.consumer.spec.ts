import { ConfigModule } from '@nestjs/config';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { addDays } from 'date-fns';
import { VisaWebsiteEvent } from 'src/visa-website/contracts/events';
import { NavigationService } from 'src/visa-website/navigation/navigation.service';
import { RescheduleConsumer } from './reschedule.consumer';

describe('Consumer', () => {
  let emitter: EventEmitter2;
  let consumer: RescheduleConsumer;
  let navigationService: NavigationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), EventEmitterModule.forRoot()],
      providers: [
        RescheduleConsumer,
        {
          provide: NavigationService,
          useValue: { selectDateForAppointment: jest.fn() },
        },
      ],
    }).compile();

    emitter = module.get<EventEmitter2>(EventEmitter2);
    consumer = module.get<RescheduleConsumer>(RescheduleConsumer);
    navigationService = module.get<NavigationService>(NavigationService);
    await module.init();
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });

  it('should try to reschedule when there are earlier dates', async () => {
    const availableDates: Date[] = Array(20)
      .fill(new Date())
      .map((date, i) => addDays(date, i - 10));

    const pageStub = { currentAppointmentDate: new Date() };
    emitter.emit(VisaWebsiteEvent.NewAvailableAppointmentDates, {
      page: pageStub,
      payload: availableDates,
    });

    expect(navigationService.selectDateForAppointment).toHaveBeenCalledWith(
      pageStub,
      availableDates[0],
    );
  });
});
