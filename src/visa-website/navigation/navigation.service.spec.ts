import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Page } from 'puppeteer';
import { GroupActionsPage, GroupSelectionPage, LoginPage } from '../contracts';
import { VisaWebsiteUrl } from '../contracts/enums';
import { identifyUrl } from '../logic';
import { NavigationService } from './navigation.service';

jest.setTimeout(120000);
describe('VisaWebsiteService', () => {
  let service: NavigationService;
  const openPages: Page[] = [];

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [NavigationService],
    }).compile();

    service = module.get<NavigationService>(NavigationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  async function getLoginPage(): Promise<LoginPage> {
    const openLoginPage = openPages.find(
      (page) => identifyUrl(page.url()) === VisaWebsiteUrl.Authentication,
    );
    if (openLoginPage) return openLoginPage;
    const newPage = await service.createNewPage();
    openPages.push(newPage);
    return newPage;
  }

  async function getGroupsPage(): Promise<GroupSelectionPage> {
    const openGroupsPage = openPages.find(
      (page) => identifyUrl(page.url()) === VisaWebsiteUrl.Groups,
    );
    if (openGroupsPage) return openGroupsPage;

    const loginPage = await getLoginPage();
    return service.authenticate(loginPage);
  }

  async function getGroupActionsPage(): Promise<GroupActionsPage> {
    const openGroupActionsPage = openPages.find(
      (page) => identifyUrl(page.url()) === VisaWebsiteUrl.GroupActions,
    );
    if (openGroupActionsPage) return openGroupActionsPage;

    const groupsPage = await getGroupsPage();
    return service.selectFirstGroup(groupsPage);
  }

  it('should start on authentication page', async () => {
    const visaWebsitePage = await service.createNewPage();
    const url = visaWebsitePage.url();
    expect(identifyUrl(url)).toBe(VisaWebsiteUrl.Authentication);
  });

  it('should correctly authenticate', async () => {
    const loginPage = await getLoginPage();
    const newPage = await service.authenticate(loginPage);
    expect(identifyUrl(newPage.url())).toBe(VisaWebsiteUrl.Groups);
  });

  it('should correctly select group', async () => {
    const groupsPage = await getGroupsPage();

    const newPage = await service.selectFirstGroup(groupsPage);
    expect(identifyUrl(newPage.url())).toBe(VisaWebsiteUrl.GroupActions);
  });

  it('should correctly navigate to reeschedule appointment page', async () => {
    const groupActionsPage = await getGroupActionsPage();
    const newPage = await service.selectRescheduleAction(groupActionsPage);
    expect(identifyUrl(newPage.url())).toBe(VisaWebsiteUrl.Reschedule);
  });

  afterAll(() => openPages.map((page) => page.browser().close()));
});
