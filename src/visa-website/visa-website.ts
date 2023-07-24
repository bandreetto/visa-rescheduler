import { Logger } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';
import { VISA_WEBSITE_SIGNIN_URL } from './contracts/consts';
import { VisaWebsitePage } from './contracts/enums';
import { identifyUrl } from './logic';

export class VisaWebsite {
  private readonly logger = new Logger(VisaWebsite.name);
  private pagePromise: Promise<Page>;
  private browser: Browser;
  public isNavigating = true;

  constructor() {
    let resolvePage: (page: Page) => void;
    this.pagePromise = new Promise((resolve) => (resolvePage = resolve));

    this.logger.log('Launching browser');
    puppeteer.launch({ headless: false }).then(async (browser) => {
      this.browser = browser;
      const [page] = await browser.pages();

      this.logger.log('Navigating to visa website');
      this.isNavigating = true;
      await page
        .goto(VISA_WEBSITE_SIGNIN_URL)
        .then(() => (this.isNavigating = false));
      this.logger.log('Navigation finished');

      this.configureEvents(page);
      resolvePage(page);
    });
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
    this.logger.log('Successful login!');
  }

  async close(): Promise<void> {
    await this.browser.close();
  }

  private configureEvents(page: Page) {
    page.on('framenavigated', (frame) => {
      const currentPage = VisaWebsitePage[frame.url()];
      console.log(currentPage);
      if (!currentPage) return;

      switch (currentPage) {
        case VisaWebsitePage.Groups:
          this.logger.log('Navigated to groups page, selecting group');
          page.click("a:contains('Continuar')");
          break;
      }
    });
  }
}
