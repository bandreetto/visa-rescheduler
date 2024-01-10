import { AvailableDate, VisaWebsitePage } from '.';

export enum VisaWebsiteEvent {
  NewAvailableAppointmentDates = 'NewAvailableAppointmentDates',
  ListedGroups = 'ListedGroups',
}

export interface PageEvent<T = null> {
  page: VisaWebsitePage;
  payload?: T;
}

export type NewAvailableAppointmentDatesEvent = PageEvent<AvailableDate[]>;

export type VisaWebsiteEventHandlers = {
  [VisaWebsiteEvent.NewAvailableAppointmentDates]: (
    event: NewAvailableAppointmentDatesEvent,
  ) => void;
  [VisaWebsiteEvent.ListedGroups]: (event: PageEvent) => void;
};
