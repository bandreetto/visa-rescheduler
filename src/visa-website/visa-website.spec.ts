import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { VisaWebsitePage } from './contracts/enums';
import { VisaWebsite } from './visa-website';

jest.setTimeout(30000);

async function waitNavigation(visaWebsite: VisaWebsite): Promise<void> {
  while (visaWebsite.isNavigating)
    await new Promise((resolve) => setTimeout(resolve, 500));
}

describe('VisaWebsite', () => {
  let configService: ConfigService;
  const openWebsites: VisaWebsite[] = [];

  function createVisaWebsite(): VisaWebsite {
    const visaWebsite = new VisaWebsite();
    openWebsites.push(visaWebsite);
    return visaWebsite;
  }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
    }).compile();

    configService = app.get<ConfigService>(ConfigService);
  });

  it('should start on authentication page', async () => {
    const visaWebsite = createVisaWebsite();
    waitNavigation(visaWebsite);
    expect(await visaWebsite.getCurrentPage()).toBe(
      VisaWebsitePage.Authentication,
    );
  });

  it('should navigate to groups page after login', async () => {
    const visaWebsite = createVisaWebsite();
    const username = configService.get('VISA_WEBSITE_USERSNAME');
    const password = configService.get('VISA_WEBSITE_PASSWORD');
    await visaWebsite.login(username, password);
    waitNavigation(visaWebsite);
    expect(await visaWebsite.getCurrentPage()).toBe(VisaWebsitePage.Groups);
  });

  it('should correctly navigate to schedule actions page', async () => {
    const visaWebsite = createVisaWebsite();
    const username = configService.get('VISA_WEBSITE_USERSNAME');
    const password = configService.get('VISA_WEBSITE_PASSWORD');
    await visaWebsite.login(username, password);
    await visaWebsite.selectFirstGroup();
    waitNavigation(visaWebsite);
    expect(await visaWebsite.getCurrentPage()).toBe(
      VisaWebsitePage.ScheduleActions,
    );
  });

  it('should correctly navigate to reeschedule appointment page', async () => {
    const visaWebsite = createVisaWebsite();
    const username = configService.get('VISA_WEBSITE_USERSNAME');
    const password = configService.get('VISA_WEBSITE_PASSWORD');
    await visaWebsite.login(username, password);
    await visaWebsite.selectFirstGroup();
    await visaWebsite.selectRescheduleAction();
    waitNavigation(visaWebsite);
    expect(await visaWebsite.getCurrentPage()).toBe(VisaWebsitePage.Reschedule);
  });

  afterEach(async () => openWebsites.map((website) => website.close()));
});
