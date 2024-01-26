import { Injectable, Logger } from '@nestjs/common';
import { equals } from 'ramda';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import puppeteer from 'puppeteer-extra';
import {
  GroupActionsPage,
  GroupSelectionPage,
  LoginPage,
  ReschedulePage,
} from '../contracts';
import { INDEX_MONTHS_DICTIONARY, SIGNIN_URL } from '../contracts/consts';
import { ConfigService } from '@nestjs/config';
import { VisaWebsiteUrl } from '../contracts/enums';
import { identifyUrl } from '../logic';

@Injectable()
export class NavigationService {
  private logger = new Logger(NavigationService.name);

  constructor(private readonly configService: ConfigService) {}

  async createNewPage(headless = true): Promise<LoginPage> {
    puppeteer.use(StealthPlugin());

    const proxyUrl = 'socks5://localhost:65397';
    this.logger.log('Launching browser');
    const browser = await puppeteer.launch({
      headless,
      args: ['--no-sandbox', '--proxy-server=' + proxyUrl],
      executablePath:
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(90000);

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

  async selectDateForAppointment(
    page: ReschedulePage,
    date: Date,
  ): Promise<ReschedulePage> {
    this.logger.log('Openning date picker');
    await page.click('#appointments_consulate_appointment_date');

    const month = INDEX_MONTHS_DICTIONARY[date.getMonth()];

    let lastVisibleYears = await page.$$eval(
      '.ui-datepicker-title',
      (elements) => elements.map((el) => el.textContent),
    );
    let visibleYears = lastVisibleYears;
    let i = 0;
    const yearAndMonthToPick = [month, date.getFullYear()].join('\u00A0');
    while (!visibleYears.includes(yearAndMonthToPick) && i < 36) {
      await page.click('.ui-datepicker-next');
      while (equals(visibleYears, lastVisibleYears)) {
        visibleYears = await page.$$eval('.ui-datepicker-title', (elements) =>
          elements.map((el) => el.textContent),
        );
      }
      lastVisibleYears = visibleYears;
      i++;
    }

    await page.evaluate((dateString) => {
      const date = new Date(dateString);
      const dates = Array.from(
        document.querySelectorAll(
          `td[data-month="${date.getMonth()}"][data-year="${date.getFullYear()}"] a`,
        ),
      );
      const targetDate = dates.find(
        (el) => el.textContent.trim() === date.getDate().toString(),
      );
      if (!targetDate || !(targetDate instanceof HTMLElement))
        throw new Error(
          `Something wen't wrong while finding day ${date.getDate()} cell to click on the DatePicker`,
        );
      targetDate.click();
    }, date);

    return page;
  }
}
