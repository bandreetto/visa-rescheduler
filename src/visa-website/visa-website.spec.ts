import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { VisaWebsitePage } from './contracts/enums';
import { VisaWebsite } from './visa-website';

jest.setTimeout(30000);

describe.skip('VisaWebsite', () => {
  let configService: ConfigService;
  const openWebsites: VisaWebsite[] = [];

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
    }).compile();

    configService = app.get<ConfigService>(ConfigService);
  });

  it('should start on authentication page', async () => {
    const visaWebsite = new VisaWebsite();
    openWebsites.push(visaWebsite);
    while (visaWebsite.isNavigating)
      await new Promise((resolve) => setTimeout(resolve, 500));
    expect(await visaWebsite.getCurrentPage()).toBe(
      VisaWebsitePage.Authentication,
    );
  });

  it('should navigate to reschedule page after login', async () => {
    const visaWebsite = new VisaWebsite();
    openWebsites.push(visaWebsite);
    const username = configService.get('VISA_WEBSITE_USERSNAME');
    const password = configService.get('VISA_WEBSITE_PASSWORD');
    await visaWebsite.login(username, password);
    while (visaWebsite.isNavigating)
      await new Promise((resolve) => setTimeout(resolve, 500));
    expect(await visaWebsite.getCurrentPage()).toBe(VisaWebsitePage.Reschedule);
  });

  afterAll(async () => openWebsites.map((website) => website.close()));
});
