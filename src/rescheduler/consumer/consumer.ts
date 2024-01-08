import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { VisaWebsiteEvent } from '../../visa-website/contracts/enums';

@Injectable()
export class Consumer {
  @OnEvent(VisaWebsiteEvent.NewAvailableScheduleDates)
  handleNewAvailableDates() {
    throw new Error('not implemented');
  }
}
