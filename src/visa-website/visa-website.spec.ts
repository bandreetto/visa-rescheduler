import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AvailableDate } from './contracts';
import { VisaWebsiteEvent, VisaWebsiteUrl } from './contracts/enums';
import { VisaWebsite } from './visa-website';

jest.setTimeout(120000);

describe.skip('VisaWebsite', () => {
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

  it('should navigate to groups page after login', async () => {
    const visaWebsite = createVisaWebsite();
    const username = configService.get('VISA_WEBSITE_USERSNAME');
    const password = configService.get('VISA_WEBSITE_PASSWORD');
    await visaWebsite.login(username, password);
    expect(await visaWebsite.getCurrentPage()).toBe(VisaWebsiteUrl.Groups);
  });

  it('should correctly navigate to schedule actions page', async () => {
    const visaWebsite = createVisaWebsite();
    const username = configService.get('VISA_WEBSITE_USERSNAME');
    const password = configService.get('VISA_WEBSITE_PASSWORD');
    await visaWebsite.login(username, password);
    await visaWebsite.selectFirstGroup();
    expect(await visaWebsite.getCurrentPage()).toBe(
      VisaWebsiteUrl.GroupActions,
    );
  });

  it('should correctly navigate to reeschedule appointment page', async () => {
    const visaWebsite = createVisaWebsite();
    const username = configService.get('VISA_WEBSITE_USERSNAME');
    const password = configService.get('VISA_WEBSITE_PASSWORD');
    await visaWebsite.login(username, password);
    await visaWebsite.selectFirstGroup();
    await visaWebsite.selectRescheduleAction();
    expect(await visaWebsite.getCurrentPage()).toBe(VisaWebsiteUrl.Reschedule);
  });

  it.only('should correclty retrieve available schedule dates', async () => {
    const visaWebsite = createVisaWebsite();
    let resolveAvailableDates: (dates: AvailableDate[]) => void;
    const availableDatesPromise = new Promise<AvailableDate[]>(
      (resolve) => (resolveAvailableDates = resolve),
    );
    visaWebsite.on(VisaWebsiteEvent.AvailableScheduleDates, (dates) =>
      resolveAvailableDates(dates),
    );

    const username = configService.get('VISA_WEBSITE_USERSNAME');
    const password = configService.get('VISA_WEBSITE_PASSWORD');
    await visaWebsite.login(username, password);
    await visaWebsite.selectFirstGroup();
    await visaWebsite.selectRescheduleAction();
    const availableDates = await availableDatesPromise;
    expect(Array.isArray(availableDates)).toBe(true);
  });

  afterEach(async () => openWebsites.map((website) => website.close()));
});
