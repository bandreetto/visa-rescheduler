import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Page } from 'puppeteer';
import {
  AvailableDate,
  GroupActionsPage,
  GroupSelectionPage,
  LoginPage,
} from '../contracts';
import { VisaWebsiteEvent, VisaWebsiteUrl } from '../contracts/enums';
import { getFirstGroupAppointmentDate, onPageEvent } from './actions';
import { identifyUrl } from './identify-url';
import {
  authenticate,
  createNewPage,
  selectFirstGroup,
  selectRescheduleAction,
} from './navigations';

jest.setTimeout(120000);
describe('Actions Logic', () => {
  let configService: ConfigService;
  const openPages: Page[] = [];

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
    }).compile();

    configService = app.get<ConfigService>(ConfigService);
  });

  async function getLoginPage(): Promise<LoginPage> {
    const openLoginPage = openPages.find(
      (page) => identifyUrl(page.url()) === VisaWebsiteUrl.Authentication,
    );
    if (openLoginPage) return openLoginPage;
    const newPage = await createNewPage();
    openPages.push(newPage);
    return newPage;
  }

  async function getGroupsPage(
    username: string,
    password: string,
  ): Promise<GroupSelectionPage> {
    const openGroupsPage = openPages.find(
      (page) => identifyUrl(page.url()) === VisaWebsiteUrl.Groups,
    );
    if (openGroupsPage) return openGroupsPage;

    const loginPage = await getLoginPage();
    return authenticate(loginPage, username, password);
  }

  async function getGroupActionsPage(
    username: string,
    password: string,
  ): Promise<GroupActionsPage> {
    const openGroupActionsPage = openPages.find(
      (page) => identifyUrl(page.url()) === VisaWebsiteUrl.GroupActions,
    );
    if (openGroupActionsPage) return openGroupActionsPage;

    const groupsPage = await getGroupsPage(username, password);
    return selectFirstGroup(groupsPage);
  }

  it('should correctly get current schedule date', async () => {
    const groupsPage = await getGroupsPage(
      configService.get('VISA_WEBSITE_USERSNAME'),
      configService.get('VISA_WEBSITE_PASSWORD'),
    );
    const currentScheduleDate = await getFirstGroupAppointmentDate(groupsPage);
    expect(currentScheduleDate.toString()).not.toBe('Invalid Date');
  });

  it('should fire new available dates event on reschedule page', async () => {
    let resolveAvailableDates: (dates: AvailableDate[]) => void;
    const availableDatesPromise: Promise<AvailableDate[]> = new Promise(
      (resolve) => (resolveAvailableDates = resolve),
    );
    const groupActionsPage = await getGroupActionsPage(
      configService.get('VISA_WEBSITE_USERSNAME'),
      configService.get('VISA_WEBSITE_PASSWORD'),
    );
    onPageEvent(
      groupActionsPage,
      VisaWebsiteEvent.NewAvailableScheduleDates,
      resolveAvailableDates,
    );
    await selectRescheduleAction(groupActionsPage);

    const availableDates = await availableDatesPromise;

    expect(Array.isArray(availableDates)).toBe(true);
  });

  afterAll(() => openPages.map((page) => page.browser().close()));
});
