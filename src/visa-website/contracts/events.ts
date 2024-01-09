import { Page } from 'puppeteer';
import { AvailableDate } from '.';

export enum VisaWebsiteEvent {
  NewAvailableAppointmentDates = 'NewAvailableAppointmentDates',
}

export interface PageEvent<T> {
  page: Page;
  payload: T;
}

export type NewAvailableAppointmentDatesEvent = PageEvent<AvailableDate[]>;

export type VisaWebsiteEventHandlers = {
  [VisaWebsiteEvent.NewAvailableAppointmentDates]: (
    event: NewAvailableAppointmentDatesEvent,
  ) => void;
};
