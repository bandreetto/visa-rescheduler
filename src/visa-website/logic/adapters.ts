import { AvailableDate } from '../contracts/dto';

export function adaptAvailableDateEventPayload(
  payload: AvailableDate[],
): Date[] {
  return payload.map((availableDate) => {
    const year = parseInt(availableDate.date.slice(0, 4), 10);
    const month = parseInt(availableDate.date.slice(5, 7), 10) - 1;
    const day = parseInt(availableDate.date.slice(8, 10), 10);
    return new Date(year, month, day);
  });
}
