import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Page } from 'puppeteer';
import { GroupActionsPage, GroupSelectionPage, LoginPage } from '../contracts';
import { VisaWebsiteUrl } from '../contracts/enums';
import { identifyUrl } from './identify-url';
import {
  authenticate,
  createNewPage,
  selectFirstGroup,
  selectRescheduleAction,
} from './navigations';

jest.setTimeout(120000);
describe('Navigations Logic', () => {
  let configService: ConfigService;
  const openPages: Page[] = [];

  async function getLoginPage(): Promise<LoginPage> {
    const openLoginPage = openPages.find(
      (page) => identifyUrl(page.url()) === VisaWebsiteUrl.Authentication,
    );
    if (openLoginPage) return openLoginPage;
    return createNewPage();
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

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
    }).compile();

    configService = app.get<ConfigService>(ConfigService);
  });

  it('should start on authentication page', async () => {
    const visaWebsitePage = await createNewPage();
    openPages.push(visaWebsitePage);
    const url = visaWebsitePage.url();
    expect(identifyUrl(url)).toBe(VisaWebsiteUrl.Authentication);
  });

  it('should correctly authenticate', async () => {
    const loginPage = await getLoginPage();
    const newPage = await authenticate(
      loginPage,
      configService.get('VISA_WEBSITE_USERSNAME'),
      configService.get('VISA_WEBSITE_PASSWORD'),
    );
    expect(identifyUrl(newPage.url())).toBe(VisaWebsiteUrl.Groups);
  });

  it('should correctly select group', async () => {
    const groupsPage = await getGroupsPage(
      configService.get('VISA_WEBSITE_USERSNAME'),
      configService.get('VISA_WEBSITE_PASSWORD'),
    );

    const newPage = await selectFirstGroup(groupsPage);
    expect(identifyUrl(newPage.url())).toBe(VisaWebsiteUrl.GroupActions);
  });

  it('should correctly navigate to reeschedule appointment page', async () => {
    const groupActionsPage = await getGroupActionsPage(
      configService.get('VISA_WEBSITE_USERSNAME'),
      configService.get('VISA_WEBSITE_PASSWORD'),
    );
    const newPage = await selectRescheduleAction(groupActionsPage);
    expect(identifyUrl(newPage.url())).toBe(VisaWebsiteUrl.Reschedule);
  });

  afterAll(() => openPages.map((page) => page.browser().close()));
});
