import { VisaWebsitePage } from './contracts/enums';
import { VisaWebsite } from './visa-website';

describe('VisaWebsite', () => {
  it('should start on authentication page', async () => {
    const visaWebsite = new VisaWebsite();
    while (visaWebsite.isNavigating)
      await new Promise((resolve) => setTimeout(resolve, 500));
    expect(visaWebsite.getCurrentPage()).toBe(VisaWebsitePage.Authentication);
    await visaWebsite.close();
  });

  it('should navigate to reschedule page after manual login', async () => {
    const visaWebsite = new VisaWebsite();

    await visaWebsite.close();
  });
});
