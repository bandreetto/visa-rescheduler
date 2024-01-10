import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  NewAvailableAppointmentDatesEvent,
  VisaWebsiteEvent,
} from 'src/visa-website/contracts/events';
import { NavigationService } from 'src/visa-website/navigation/navigation.service';
import { getDateToReschedule } from '../logic';

@Injectable()
export class RescheduleConsumer {
  private logger = new Logger(RescheduleConsumer.name);
  constructor(private readonly navigationService: NavigationService) {}

  @OnEvent(VisaWebsiteEvent.NewAvailableAppointmentDates)
  handleNewAvailableDates(event: NewAvailableAppointmentDatesEvent) {
    const dateToSchedule = getDateToReschedule(
      event.page.currentAppointmentDate,
      event.payload,
    );

    if (!dateToSchedule) return;

    this.logger.log(
      `Found earlier date available (${dateToSchedule.toLocaleDateString()}), rescheduling...`,
    );
    this.navigationService.selectDateForAppointment(dateToSchedule);
  }
}
