import { addDays, subHours } from 'date-fns';
import { AvailableDate } from 'src/visa-website/contracts';
import { shouldReschedule } from './logic';

describe('Rescheduler Logic', () => {
  it('should return true when there are newer dates than current', () => {
    const currentDate = new Date();
    const availableDates: AvailableDate[] = Array(20)
      .fill(new Date())
      .map((date, i) => addDays(date, i - 10))
      .map((date) => ({ date, business_date: true }));

    expect(shouldReschedule(currentDate, availableDates)).toBe(true);
  });

  it('should return false when there are only date later than current', () => {
    const currentDate = new Date();
    const availableDates: AvailableDate[] = Array(20)
      .fill(new Date())
      .map((date, i) => addDays(date, i + 10))
      .map((date) => ({ date, business_date: true }));

    expect(shouldReschedule(currentDate, availableDates)).toBe(false);
  });

  it('should return false when newest date day is the same as current', () => {
    const currentDate = new Date();
    const availableDates: AvailableDate[] = Array(20)
      .fill(new Date())
      .map((date, i) => subHours(addDays(date, i), 1))
      .map((date) => ({ date, business_date: true }));

    expect(shouldReschedule(currentDate, availableDates)).toBe(false);
  });
});
