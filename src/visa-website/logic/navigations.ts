import { GroupSelectionPage, LoginPage } from '../contracts';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import puppeteer from 'puppeteer-extra';
import { SIGNIN_URL } from '../contracts/consts';
import { Logger } from '@nestjs/common';
import { identifyUrl } from './identify-url';
import { VisaWebsiteUrl } from '../contracts/enums';

export async function createNewPage(): Promise<LoginPage> {
  const logger = new Logger('Logic/createNewPage');
  puppeteer.use(StealthPlugin());

  logger.log('Launching browser');
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox'],
    executablePath:
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });

  const page = await browser.newPage();

  logger.log('Navigating to visa website');
  await page.goto(SIGNIN_URL);
  logger.log('Navigation finished');

  return page;
}

export async function authenticate(
  page: LoginPage,
  username: string,
  password: string,
): Promise<GroupSelectionPage> {
  const logger = new Logger('Logic/createNewPage');

  logger.log('Inputting username: ' + username);
  await page.type('#user_email', username);

  logger.log('Inutting password');
  await page.type('#user_password', password);

  logger.log('Checking policy checkbox');
  await page.click('#policy_confirmed');

  logger.log('Clicking login button');
  await page.click('[name="commit"]');

  logger.log('Logging in');
  await page.waitForNavigation();
  logger.log('Login Successful!');

  if (identifyUrl(page.url()) === VisaWebsiteUrl.Groups) return page;

  throw new Error('Navigated to unexpected page after authentication');
}
