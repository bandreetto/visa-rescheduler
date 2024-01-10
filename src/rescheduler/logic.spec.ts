import { addDays, subHours } from 'date-fns';
import { AvailableDate } from 'src/visa-website/contracts';
import { getDateToReschedule } from './logic';

describe('Rescheduler Logic', () => {
  it('should return the earliest date when there are earlier dates than current', () => {
    const currentDate = new Date();
    const availableDates: AvailableDate[] = Array(20)
      .fill(new Date())
      .map((date, i) => addDays(date, i - 10))
      .map((date) => ({ date, business_date: true }));

    expect(getDateToReschedule(currentDate, availableDates)).toBe(
      availableDates[0].date,
    );
  });

  it('should return null when there are only date later than current', () => {
    const currentDate = new Date();
    const availableDates: AvailableDate[] = Array(20)
      .fill(new Date())
      .map((date, i) => addDays(date, i + 10))
      .map((date) => ({ date, business_date: true }));

    expect(getDateToReschedule(currentDate, availableDates)).toBe(null);
  });

  it('should return null when newest date day is the same as current', () => {
    const currentDate = new Date();
    const availableDates: AvailableDate[] = Array(20)
      .fill(new Date())
      .map((date, i) => subHours(addDays(date, i), 1))
      .map((date) => ({ date, business_date: true }));

    expect(getDateToReschedule(currentDate, availableDates)).toBe(null);
  });
});
