import { Logger } from '@nestjs/common';
import { EventEmitter } from 'node:events';
import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { AvailableDate } from './contracts';
import {
  AVAILABLE_SCHEDULE_DATES_RESOURCE_REGEX,
  SIGNIN_URL,
} from './contracts/consts';
import { VisaWebsiteEvent, VisaWebsitePage } from './contracts/enums';
import { identifyUrl } from './logic';

type VisaWebsiteEventHandlers = {
  [VisaWebsiteEvent.AvailableScheduleDates]: (dates: AvailableDate[]) => void;
};

export class VisaWebsite {
  private readonly logger = new Logger(VisaWebsite.name);
  private pagePromise: Promise<Page>;
  private browser: Browser;
  private emitter = new EventEmitter();
  public isNavigating = true;

  constructor() {
    puppeteer.use(StealthPlugin());

    let resolvePage: (page: Page) => void;
    this.pagePromise = new Promise((resolve) => (resolvePage = resolve));

    this.logger.log('Launching browser');
    puppeteer
      .launch({
        headless: false,
        args: ['--no-sandbox'],
        executablePath:
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      })
      .then(async (browser) => {
        this.browser = browser;
        const page = await browser.newPage();

        this.logger.log('Navigating to visa website');
        this.isNavigating = true;
        await page.goto(SIGNIN_URL).then(() => (this.isNavigating = false));
        this.logger.log('Navigation finished');

        this.configureEvents(page);
        resolvePage(page);
      });
  }

  configureEvents(page: Page): void {
    page.on('response', async (response) => {
      const isAvailableScheduleOptions =
        AVAILABLE_SCHEDULE_DATES_RESOURCE_REGEX.test(response.url());
      if (isAvailableScheduleOptions) {
        this.logger.log('Found new available schedule dates!');
        this.emitter.emit(
          VisaWebsiteEvent.AvailableScheduleDates,
          await response.json(),
        );
      }
    });
  }

  on<T extends VisaWebsiteEvent>(
    event: T,
    handler: VisaWebsiteEventHandlers[T],
  ) {
    this.logger.log(`Registering listener for event ${event}`);
    this.emitter.on(event, handler);
  }

  async getCurrentPage(): Promise<VisaWebsitePage> {
    const page = await this.pagePromise;
    return identifyUrl(page.url());
  }

  async login(username: string, password: string): Promise<void> {
    const page = await this.pagePromise;

    this.logger.log('Inputting username: ' + username);
    await page.type('#user_email', username);

    this.logger.log('Inutting password');
    await page.type('#user_password', password);

    this.logger.log('Checking policy checkbox');
    await page.click('#policy_confirmed');

    this.logger.log('Clicking login button');
    await page.click('[name="commit"]');

    this.isNavigating = true;
    this.logger.log('Logging in');
    await page.waitForNavigation();
    this.logger.log('Login Successful!');
    this.isNavigating = false;
  }

  async selectFirstGroup(): Promise<void> {
    this.logger.log('Selecting first group');

    const page = await this.pagePromise;
    await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a'));
      const anchor = anchors.find((a) => a.textContent === 'Continuar');
      if (!anchor) throw new Error('Could not find groups continue button');
      anchor.click();
    });

    this.isNavigating = true;
    this.logger.log('Group selected successfully!');
    await page.waitForNavigation();
    this.isNavigating = false;
  }

  async selectRescheduleAction(): Promise<void> {
    this.logger.log('Selecting reschedule action');

    const page = await this.pagePromise;

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

    this.isNavigating = true;
    this.logger.log('Reschedule action selected successfully');
    await page.waitForNavigation();
    this.isNavigating = false;
  }

  async close(): Promise<void> {
    await this.browser.close();
  }
}
