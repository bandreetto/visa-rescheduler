import {
  VISA_WEBSITE_GROUPS_BASE_URL,
  VISA_WEBSITE_SIGNIN_URL,
} from './contracts/consts';
import { VisaWebsitePage } from './contracts/enums';
import { identifyUrl } from './logic';

describe('Visa Website Logic', () => {
  it('should correclty identify authentication page', () => {
    const page = identifyUrl(VISA_WEBSITE_SIGNIN_URL);
    expect(page).toBe(VisaWebsitePage.Authentication);
  });

  it('should correctly identify groups page', () => {
    const page = identifyUrl(
      VISA_WEBSITE_GROUPS_BASE_URL + '/' + Math.round(Math.random() * 1000000),
    );
    expect(page).toBe(VisaWebsitePage.Groups);
  });
});
