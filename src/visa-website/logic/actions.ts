import { Logger } from '@nestjs/common';
import { Page } from 'puppeteer';
import { AvailableDate, GroupSelectionPage } from '../contracts';
import { AVAILABLE_SCHEDULE_DATES_RESOURCE_REGEX } from '../contracts/consts';
import { VisaWebsiteEvent } from '../contracts/enums';

type VisaWebsiteEventHandlers = {
  [VisaWebsiteEvent.NewAvailableScheduleDates]: (
    dates: AvailableDate[],
  ) => void;
};

const eventUrlRegexes: Record<VisaWebsiteEvent, RegExp> = {
  [VisaWebsiteEvent.NewAvailableScheduleDates]:
    AVAILABLE_SCHEDULE_DATES_RESOURCE_REGEX,
};

export function onPageEvent<T extends VisaWebsiteEvent>(
  page: Page,
  event: T,
  callback: VisaWebsiteEventHandlers[T],
) {
  new Logger('VisaWebstie/Actions').log(
    `Registering listener for event ${event}`,
  );
  page.on('response', async (response) => {
    const isCorrectEvent = eventUrlRegexes[event].test(response.url());
    if (isCorrectEvent) {
      callback(await response.json());
    }
  });
}

const monthsDictionary: Record<string, number> = {
  Janeiro: 0,
  Fevereiro: 1,
  Março: 2,
  Abril: 3,
  Maio: 4,
  Junho: 5,
  Julho: 6,
  Agosto: 7,
  Setembro: 8,
  Outubro: 9,
  Novembro: 10,
  Dezembro: 11,
};

export async function getFirstGroupAppointmentDate(
  page: GroupSelectionPage,
): Promise<Date> {
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
