import { Injectable, Logger } from '@nestjs/common';
import { Page } from 'puppeteer';
import {
  GroupSelectionPage,
  monthsDictionary,
  VisaWebsiteEventHandlers,
} from '../contracts';
import { EVENT_URL_REGEXES } from '../contracts/consts';
import { VisaWebsiteEvent } from '../contracts/enums';

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
        callback(await response.json());
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
    const month = monthsDictionary[parts[0].split(' ')[1]];
    const year = parseInt(parts[1], 10);
    const time = parts[2].split(' ')[0];

    return new Date(
      year,
      month,
      day,
      ...time.split(':').map((digits) => parseInt(digits, 10)),
    );
  }
}
