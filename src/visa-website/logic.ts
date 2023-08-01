import {
  GROUPS_URL_REGEX,
  RESCHEDULE_URL_REGEX,
  SCHEDULE_ACTIONS_URL_REGEX,
  SIGNIN_URL,
} from './contracts/consts';
import { VisaWebsitePage } from './contracts/enums';

const staticPages = {
  [SIGNIN_URL]: VisaWebsitePage.Authentication,
};

export function identifyUrl(url: string): VisaWebsitePage {
  const staticPage = staticPages[url];

  if (staticPage) return staticPage;

  if (GROUPS_URL_REGEX.test(url)) return VisaWebsitePage.Groups;
  if (SCHEDULE_ACTIONS_URL_REGEX.test(url))
    return VisaWebsitePage.ScheduleActions;
  if (RESCHEDULE_URL_REGEX.test(url)) return VisaWebsitePage.Reschedule;

  throw new Error(`Could not identify page with url: ${url}`);
}
