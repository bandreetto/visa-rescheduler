import { addDays, startOfDay } from 'date-fns';
import { AvailableDate } from '../contracts/dto';
import { adaptAvailableDateEventPayload } from './adapters';

describe('Visa Website Adapters', () => {
  it('Should correctly adapt available dates to dates', () => {
    const dates: Date[] = Array(20)
      .fill(new Date())
      .map((date, i) => addDays(date, i - 10));
    const availableDates: AvailableDate[] = dates.map((date) => ({
      business_date: true,
      date: date.toISOString().slice(0, 10),
    }));

    const adaptedDates = adaptAvailableDateEventPayload(availableDates);

    expect(adaptedDates.map(startOfDay)).toEqual(dates.map(startOfDay));
  });
});
