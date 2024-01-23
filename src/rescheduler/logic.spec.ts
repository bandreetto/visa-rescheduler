import { addDays, subHours } from 'date-fns';
import { getDateToReschedule } from './logic';

describe('Rescheduler Logic', () => {
  it('should return the earliest date when there are earlier dates than current', () => {
    const currentDate = new Date();
    const availableDates: Date[] = Array(20)
      .fill(new Date())
      .map((date, i) => addDays(date, i - 10));

    expect(getDateToReschedule(currentDate, availableDates)).toBe(
      availableDates[0],
    );
  });

  it('should return null when there are only date later than current', () => {
    const currentDate = new Date();
    const availableDates: Date[] = Array(20)
      .fill(new Date())
      .map((date, i) => addDays(date, i + 10));

    expect(getDateToReschedule(currentDate, availableDates)).toBe(null);
  });

  it('should return null when newest date day is the same as current', () => {
    const currentDate = new Date();
    const availableDates: Date[] = Array(20)
      .fill(new Date())
      .map((date, i) => subHours(addDays(date, i), 1));

    expect(getDateToReschedule(currentDate, availableDates)).toBe(null);
  });
});
