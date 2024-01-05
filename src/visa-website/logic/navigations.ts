import {
  GroupActionsPage,
  GroupSelectionPage,
  LoginPage,
  ReschedulePage,
} from '../contracts';
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
  const logger = new Logger('Logic/authenticate');

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

export async function selectFirstGroup(
  page: GroupSelectionPage,
): Promise<GroupActionsPage> {
  const logger = new Logger('Logic/selectFirstGroup');
  logger.log('Selecting first group');

  await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a'));
    const anchor = anchors.find((a) => a.textContent === 'Continuar');
    if (!anchor) throw new Error('Could not find groups continue button');
    anchor.click();
  });

  logger.log('Group selected successfully!');
  await page.waitForNavigation();

  if (identifyUrl(page.url()) === VisaWebsiteUrl.GroupActions) return page;

  throw new Error('Navigated to unexpected page after group selection');
}

export async function selectRescheduleAction(
  page: GroupActionsPage,
): Promise<ReschedulePage> {
  const logger = new Logger('Logic/selectRescheduleAction');
  logger.log('Selecting reschedule action');

  logger.log('Openning reschedule accordion');
  await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('h5'));
    const anchor = anchors.find((h5) =>
      h5.textContent.includes('Reagendar entrevista'),
    );
    if (!anchor) throw new Error('Could not find reschedule accordion');
    anchor.click();
  });

  logger.log('Clicking reschedule action');
  await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a'));
    const anchor = anchors.find(
      (a) => a.textContent === 'Reagendar entrevista',
    );
    if (!anchor) throw new Error('Could not find groups continue button');
    anchor.click();
  });

  logger.log('Reschedule action selected successfully');
  await page.waitForNavigation();

  if (identifyUrl(page.url()) === VisaWebsiteUrl.Reschedule) return page;

  throw new Error(
    'Navigated to unexpected page after selecting reschedule page',
  );
}
