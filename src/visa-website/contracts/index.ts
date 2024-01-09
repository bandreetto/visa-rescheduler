import { Page } from 'puppeteer';
import { AvailableDate } from './available-date';
import { VisaWebsiteEvent } from './enums';

export * from './available-date';

export class LoginPage extends Page {}

export class GroupSelectionPage extends Page {}

export class GroupActionsPage extends Page {}

export class ReschedulePage extends Page {}
