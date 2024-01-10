import { Injectable, Logger } from '@nestjs/common';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import puppeteer from 'puppeteer-extra';
import {
  GroupActionsPage,
  GroupSelectionPage,
  LoginPage,
  ReschedulePage,
} from '../contracts';
import { SIGNIN_URL } from '../contracts/consts';
import { ConfigService } from '@nestjs/config';
import { VisaWebsiteUrl } from '../contracts/enums';
import { identifyUrl } from '../logic';

@Injectable()
export class NavigationService {
  private logger = new Logger(NavigationService.name);

  constructor(private readonly configService: ConfigService) {}

  async createNewPage(headless = true): Promise<LoginPage> {
    puppeteer.use(StealthPlugin());

    this.logger.log('Launching browser');
    const browser = await puppeteer.launch({
      headless,
      args: ['--no-sandbox'],
      executablePath:
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    });

    const page = await browser.newPage();

    this.logger.log('Navigating to visa website');
    await page.goto(SIGNIN_URL);
    this.logger.log('Navigation finished');

    return page;
  }

  async authenticate(page: LoginPage): Promise<GroupSelectionPage> {
    const username = this.configService.get('VISA_WEBSITE_USERSNAME');
    const password = this.configService.get('VISA_WEBSITE_PASSWORD');

    this.logger.log('Inputting username: ' + username);
    await page.type('#user_email', username);

    this.logger.log('Inutting password');
    await page.type('#user_password', password);

    this.logger.log('Checking policy checkbox');
    await page.click('#policy_confirmed');

    this.logger.log('Clicking login button');
    await page.click('[name="commit"]');

    this.logger.log('Logging in');
    await page.waitForNavigation();
    this.logger.log('Login Successful!');

    if (identifyUrl(page.url()) === VisaWebsiteUrl.Groups) return page;

    throw new Error('Navigated to unexpected page after authentication');
  }

  async selectFirstGroup(page: GroupSelectionPage): Promise<GroupActionsPage> {
    this.logger.log('Selecting first group');

    await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a'));
      const anchor = anchors.find((a) => a.textContent === 'Continuar');
      if (!anchor) throw new Error('Could not find groups continue button');
      anchor.click();
    });

    this.logger.log('Group selected successfully!');
    await page.waitForNavigation();

    if (identifyUrl(page.url()) === VisaWebsiteUrl.GroupActions) return page;

    throw new Error('Navigated to unexpected page after group selection');
  }

  async selectRescheduleAction(
    page: GroupActionsPage,
  ): Promise<ReschedulePage> {
    this.logger.log('Selecting reschedule action');

    this.logger.log('Openning reschedule accordion');
    await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('h5'));
      const anchor = anchors.find((h5) =>
        h5.textContent.includes('Reagendar entrevista'),
      );
      if (!anchor) throw new Error('Could not find reschedule accordion');
      anchor.click();
    });

    this.logger.log('Clicking reschedule action');
    await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a'));
      const anchor = anchors.find(
        (a) => a.textContent === 'Reagendar entrevista',
      );
      if (!anchor) throw new Error('Could not find groups continue button');
      anchor.click();
    });

    this.logger.log('Reschedule action selected successfully');
    await page.waitForNavigation();

    if (identifyUrl(page.url()) === VisaWebsiteUrl.Reschedule) return page;

    throw new Error(
      'Navigated to unexpected page after selecting reschedule page',
    );
  }

  async selectDateForAppointment(date: Date): Promise<void> {
    throw new Error('not implemented');
  }
}
