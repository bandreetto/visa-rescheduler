import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Page } from 'puppeteer';
import { AvailableDate } from '../contracts';
import { VisaWebsiteEvent } from '../contracts/enums';
import { onPageEvent } from './listen-event';
import {
  authenticate,
  createNewPage,
  selectFirstGroup,
  selectRescheduleAction,
} from './navigations';

jest.setTimeout(120000);
describe('Listen Visa Website Event Logic', () => {
  let configService: ConfigService;
  let openPage: Page;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
    }).compile();

    configService = app.get<ConfigService>(ConfigService);
  });

  it('should fire new available dates event on reschedule page', async () => {
    let resolveAvailableDates: (dates: AvailableDate[]) => void;
    const availableDatesPromise: Promise<AvailableDate[]> = new Promise(
      (resolve) => (resolveAvailableDates = resolve),
    );
    const newPage = await createNewPage();
    openPage = newPage;
    onPageEvent(
      newPage,
      VisaWebsiteEvent.NewAvailableScheduleDates,
      resolveAvailableDates,
    );
    const groupsPage = await authenticate(
      newPage,
      configService.get('VISA_WEBSITE_USERSNAME'),
      configService.get('VISA_WEBSITE_PASSWORD'),
    );
    const groupActionsPage = await selectFirstGroup(groupsPage);
    await selectRescheduleAction(groupActionsPage);

    const availableDates = await availableDatesPromise;

    expect(Array.isArray(availableDates)).toBe(true);
  });

  afterAll(() => openPage.browser().close());
});
