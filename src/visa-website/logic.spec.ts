import {
  GROUPS_BASE_URL,
  SCHEDULE_ACTIONS_BASE_URL,
  SIGNIN_URL,
} from './contracts/consts';
import { VisaWebsitePage } from './contracts/enums';
import { identifyUrl } from './logic';

describe('Visa Website Logic', () => {
  it('should correclty identify authentication page', () => {
    const page = identifyUrl(SIGNIN_URL);
    expect(page).toBe(VisaWebsitePage.Authentication);
  });

  it('should correctly identify groups page', () => {
    const page = identifyUrl(
      GROUPS_BASE_URL + '/' + Math.round(Math.random() * 1000000),
    );
    expect(page).toBe(VisaWebsitePage.Groups);
  });

  it('should correctly identify schedule actions page', () => {
    const page = identifyUrl(
      `${SCHEDULE_ACTIONS_BASE_URL}/${Math.round(
        Math.random() * 1000000,
      )}/continue_actions`,
    );
    expect(page).toBe(VisaWebsitePage.ScheduleActions);
  });

  it('should correctly identify reschedule page', () => {
    const page = identifyUrl(
      `${SCHEDULE_ACTIONS_BASE_URL}/${Math.round(
        Math.random() * 1000000,
      )}/appointment`,
    );
    expect(page).toBe(VisaWebsitePage.Reschedule);
  });

  it('should throw error on unknown page', () => {
    expect(() => identifyUrl('garbage')).toThrow(
      'Could not identify page with url: garbage',
    );
  });
});
