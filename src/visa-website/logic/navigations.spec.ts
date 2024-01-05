import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Page } from 'puppeteer';
import { LoginPage } from '../contracts';
import { VisaWebsiteUrl } from '../contracts/enums';
import { identifyUrl } from './identify-url';
import { authenticate, createNewPage } from './navigations';

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

  afterAll(() => openPages.map((page) => page.browser().close()));
});
