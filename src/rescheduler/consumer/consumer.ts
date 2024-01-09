import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { VisaWebsiteEvent } from 'src/visa-website/contracts/events';

@Injectable()
export class Consumer {
  @OnEvent(VisaWebsiteEvent.NewAvailableAppointmentDates)
  handleNewAvailableDates() {
    throw new Error('not implemented');
  }
}
