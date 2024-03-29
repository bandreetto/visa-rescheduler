import { Page } from 'puppeteer';
import { AvailableDate } from './available-date';

export * from './available-date';

export class VisaWebsitePage extends Page {
  currentAppointmentDate?: Date;
}

export class LoginPage extends VisaWebsitePage {}

export class GroupSelectionPage extends VisaWebsitePage {}

export class GroupActionsPage extends VisaWebsitePage {}

export class ReschedulePage extends VisaWebsitePage {}
