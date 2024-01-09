import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Page } from 'puppeteer';
import {
  AvailableDate,
  GroupActionsPage,
  GroupSelectionPage,
  LoginPage,
} from '../contracts';
import { VisaWebsiteEvent, VisaWebsiteUrl } from '../contracts/enums';
import { identifyUrl } from '../logic';
import { NavigationService } from '../navigation/navigation.service';
import { WebsiteActionsService } from './website-actions.service';

jest.setTimeout(120000);
describe('WebsiteActionsService', () => {
  const openPages: Page[] = [];
  let service: WebsiteActionsService;
  let navigationService: NavigationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [WebsiteActionsService, NavigationService],
    }).compile();

    service = module.get<WebsiteActionsService>(WebsiteActionsService);
    navigationService = module.get<NavigationService>(NavigationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  async function getLoginPage(): Promise<LoginPage> {
    const openLoginPage = openPages.find(
      (page) => identifyUrl(page.url()) === VisaWebsiteUrl.Authentication,
    );
    if (openLoginPage) return openLoginPage;
    const newPage = await navigationService.createNewPage();
    openPages.push(newPage);
    return newPage;
  }

  async function getGroupsPage(): Promise<GroupSelectionPage> {
    const openGroupsPage = openPages.find(
      (page) => identifyUrl(page.url()) === VisaWebsiteUrl.Groups,
    );
    if (openGroupsPage) return openGroupsPage;

    const loginPage = await getLoginPage();
    return navigationService.authenticate(loginPage);
  }

  async function getGroupActionsPage(): Promise<GroupActionsPage> {
    const openGroupActionsPage = openPages.find(
      (page) => identifyUrl(page.url()) === VisaWebsiteUrl.GroupActions,
    );
    if (openGroupActionsPage) return openGroupActionsPage;

    const groupsPage = await getGroupsPage();
    return navigationService.selectFirstGroup(groupsPage);
  }

  it('should correctly get current schedule date', async () => {
    const groupsPage = await getGroupsPage();
    const currentScheduleDate = await service.getFirstGroupAppointmentDate(
      groupsPage,
    );
    expect(currentScheduleDate.toString()).not.toBe('Invalid Date');
  });

  it('should fire new available dates event on reschedule page', async () => {
    let resolveAvailableDates: (dates: AvailableDate[]) => void;
    const availableDatesPromise: Promise<AvailableDate[]> = new Promise(
      (resolve) => (resolveAvailableDates = resolve),
    );
    const groupActionsPage = await getGroupActionsPage();
    service.listenPageEvent(
      groupActionsPage,
      VisaWebsiteEvent.NewAvailableScheduleDates,
      resolveAvailableDates,
    );
    await navigationService.selectRescheduleAction(groupActionsPage);

    const availableDates = await availableDatesPromise;

    expect(Array.isArray(availableDates)).toBe(true);
  });

  afterAll(() => openPages.map((page) => page.browser().close()));
});
