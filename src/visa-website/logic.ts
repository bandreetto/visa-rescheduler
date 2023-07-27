import {
  VISA_WEBSITE_GROUPS_URL_REGEX,
  VISA_WEBSITE_RESCHEDULE_URL_REGEX,
  VISA_WEBSITE_SCHEDULE_ACTIONS_URL_REGEX,
  VISA_WEBSITE_SIGNIN_URL,
} from './contracts/consts';
import { VisaWebsitePage } from './contracts/enums';

const staticPages = {
  [VISA_WEBSITE_SIGNIN_URL]: VisaWebsitePage.Authentication,
};

export function identifyUrl(url: string): VisaWebsitePage {
  const staticPage = staticPages[url];

  if (staticPage) return staticPage;

  if (VISA_WEBSITE_GROUPS_URL_REGEX.test(url)) return VisaWebsitePage.Groups;
  if (VISA_WEBSITE_SCHEDULE_ACTIONS_URL_REGEX.test(url))
    return VisaWebsitePage.ScheduleActions;
  if (VISA_WEBSITE_RESCHEDULE_URL_REGEX.test(url))
    return VisaWebsitePage.Reschedule;

  throw new Error(`Could not identify page with url: ${url}`);
}
