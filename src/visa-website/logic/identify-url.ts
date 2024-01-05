import {
  GROUPS_URL_REGEX,
  RESCHEDULE_URL_REGEX,
  SCHEDULE_ACTIONS_URL_REGEX,
  SIGNIN_URL,
} from '../contracts/consts';
import { VisaWebsiteUrl } from '../contracts/enums';

const staticPages = {
  [SIGNIN_URL]: VisaWebsiteUrl.Authentication,
};

export function identifyUrl(url: string): VisaWebsiteUrl {
  const staticPage = staticPages[url];

  if (staticPage) return staticPage;

  if (GROUPS_URL_REGEX.test(url)) return VisaWebsiteUrl.Groups;
  if (SCHEDULE_ACTIONS_URL_REGEX.test(url))
    return VisaWebsiteUrl.ScheduleActions;
  if (RESCHEDULE_URL_REGEX.test(url)) return VisaWebsiteUrl.Reschedule;

  throw new Error(`Could not identify page with url: ${url}`);
}
