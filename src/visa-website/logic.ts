import {
  VISA_WEBSITE_GROUPS_URL_REGEX,
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
}
