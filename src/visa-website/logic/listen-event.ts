import { Logger } from '@nestjs/common';
import { Page } from 'puppeteer';
import { AvailableDate } from '../contracts';
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
  new Logger('VisaWebstie/onPageEvent').log(
    `Registering listener for event ${event}`,
  );
  page.on('response', async (response) => {
    const isCorrectEvent = eventUrlRegexes[event].test(response.url());
    if (isCorrectEvent) {
      callback(await response.json());
    }
  });
}
