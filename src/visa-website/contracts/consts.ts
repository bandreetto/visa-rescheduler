import { VisaWebsiteEvent } from './enums';

export const VISA_WEBSITE_ROOT_URL = 'https://ais.usvisa-info.com/pt-br/niv';
export const SIGNIN_URL = `${VISA_WEBSITE_ROOT_URL}/users/sign_in`;
export const GROUPS_BASE_URL = `${VISA_WEBSITE_ROOT_URL}/groups`;
export const GROUPS_URL_REGEX =
  /https:\/\/ais\.usvisa-info\.com\/pt-br\/niv\/groups\/\d+/;
export const SCHEDULE_ACTIONS_BASE_URL = `${VISA_WEBSITE_ROOT_URL}/schedule`;
export const SCHEDULE_ACTIONS_URL_REGEX =
  /https:\/\/ais\.usvisa-info\.com\/pt-br\/niv\/schedule\/\d+\/continue_actions/;
export const RESCHEDULE_URL_REGEX =
  /https:\/\/ais\.usvisa-info\.com\/pt-br\/niv\/schedule\/\d+\/appointment/;
export const AVAILABLE_SCHEDULE_DATES_RESOURCE_REGEX =
  /https:\/\/ais\.usvisa-info\.com\/pt-br\/niv\/schedule\/\d+\/appointment\/days\/56\.json/;

export const EVENT_URL_REGEXES: Record<VisaWebsiteEvent, RegExp> = {
  [VisaWebsiteEvent.NewAvailableScheduleDates]:
    AVAILABLE_SCHEDULE_DATES_RESOURCE_REGEX,
};
