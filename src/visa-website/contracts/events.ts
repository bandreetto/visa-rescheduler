import { GroupSelectionPage, ReschedulePage, VisaWebsitePage } from '.';
import { adaptAvailableDateEventPayload } from '../logic/adapters';
import { AVAILABLE_SCHEDULE_DATES_RESOURCE_REGEX } from './consts';

export enum VisaWebsiteEvent {
  NewAvailableAppointmentDates = 'NewAvailableAppointmentDates',
  ListedGroups = 'ListedGroups',
}

export const EVENT_URL_REGEXES: Record<VisaWebsiteEvent, RegExp> = {
  [VisaWebsiteEvent.NewAvailableAppointmentDates]:
    AVAILABLE_SCHEDULE_DATES_RESOURCE_REGEX,
  [VisaWebsiteEvent.ListedGroups]: null,
};

export interface PageEvent<T extends VisaWebsitePage, U = null> {
  page: T;
  payload?: U;
}

export type VisaWebsiteEventHandlers = {
  [VisaWebsiteEvent.NewAvailableAppointmentDates]: (
    event: PageEvent<ReschedulePage, Date[]>,
  ) => void;
  [VisaWebsiteEvent.ListedGroups]: (
    event: PageEvent<GroupSelectionPage>,
  ) => void;
};

export const PAYLOAD_ADAPTERS = {
  [VisaWebsiteEvent.NewAvailableAppointmentDates]:
    adaptAvailableDateEventPayload,
  [VisaWebsiteEvent.ListedGroups]: () => null,
} as const;
