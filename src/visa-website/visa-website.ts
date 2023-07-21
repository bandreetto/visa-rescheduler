import { Logger, NotImplementedException } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';
import { VISA_WEBSITE_URL } from './contracts/consts';
import { VisaWebsitePage } from './contracts/enums';

const PagesUrlMap = {
  'https://ais.usvisa-info.com/pt-br/niv/users/sign_in':
    VisaWebsitePage.Authentication,
};

export class VisaWebsite {
  private readonly logger = new Logger(VisaWebsite.name);
  private page: Page;
  private browser: Browser;
  public isNavigating = true;

  constructor() {
    this.logger.log('Launching browser');
    puppeteer.launch().then(async (browser) => {
      this.browser = browser;
      const [page] = await browser.pages();

      this.logger.log('Navigating to visa website');
      this.isNavigating = true;
      page.goto(VISA_WEBSITE_URL).then(() => (this.isNavigating = false));
      this.logger.log('Navigation finished');
      this.page = page;
    });
  }

  getCurrentPage(): VisaWebsitePage {
    return PagesUrlMap[this.page.url()];
  }

  async close(): Promise<void> {
    await this.browser.close();
  }
}
