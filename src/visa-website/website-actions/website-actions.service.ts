import { Injectable, Logger } from '@nestjs/common';
import { Page } from 'puppeteer';
import { GroupSelectionPage, ReschedulePage } from '../contracts';
import { MONTHS_INDEX_DICTIONARY } from '../contracts/consts';
import {
  EVENT_URL_REGEXES,
  PAYLOAD_ADAPTERS,
  VisaWebsiteEvent,
  VisaWebsiteEventHandlers,
} from '../contracts/events';

@Injectable()
export class WebsiteActionsService {
  private logger = new Logger(WebsiteActionsService.name);

  listenPageEvent<T extends VisaWebsiteEvent>(
    page: Page,
    event: T,
    callback: VisaWebsiteEventHandlers[T],
  ): void {
    this.logger.log(`Registering listener for event ${event}`);
    page.on('response', async (response) => {
      const isCorrectEvent = EVENT_URL_REGEXES[event].test(response.url());
      if (isCorrectEvent) {
        const payload = PAYLOAD_ADAPTERS[event](await response.json());
        callback({ page, payload });
      }
    });
  }

  async getFirstGroupAppointmentDate(page: GroupSelectionPage): Promise<Date> {
    const appointmentDates = await page.$$eval('.consular-appt', (elements) =>
      elements.map((element) => element.textContent.trim()),
    );

    const dateText = appointmentDates[0].split('\n ')[1]; // <day> <month>, <year>, <time> <location>
    const parts = dateText.split(', ');
    const day = parseInt(parts[0].split(' ')[0], 10);
    const month = MONTHS_INDEX_DICTIONARY[parts[0].split(' ')[1]];
    const year = parseInt(parts[1], 10);
    const time = parts[2].split(' ')[0];

    return new Date(
      year,
      month,
      day,
      ...time.split(':').map((digits) => parseInt(digits, 10)),
    );
  }

  async getSelectedRescheduleDate(page: ReschedulePage): Promise<Date | null> {
    const rescheduleDateInputSelector =
      '#appointments_consulate_appointment_date';
    const dateText = await page.evaluate((inputSelector) => {
      const input: HTMLInputElement = document.querySelector(inputSelector);
      return input.value;
    }, rescheduleDateInputSelector);

    const year = parseInt(dateText.slice(0, 4), 10);
    const month = parseInt(dateText.slice(5, 7), 10) - 1;
    const day = parseInt(dateText.slice(8, 10), 10);

    if (dateText) return new Date(year, month, day);
    return null;
  }
}
