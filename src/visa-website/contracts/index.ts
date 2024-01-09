import { Page } from 'puppeteer';
import { AvailableDate } from './available-date';
import { VisaWebsiteEvent } from './enums';

export * from './available-date';

export class LoginPage extends Page {}

export class GroupSelectionPage extends Page {}

export class GroupActionsPage extends Page {}

export class ReschedulePage extends Page {}

export const monthsDictionary: Record<string, number> = {
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

export type VisaWebsiteEventHandlers = {
  [VisaWebsiteEvent.NewAvailableScheduleDates]: (
    dates: AvailableDate[],
  ) => void;
};
