import { isBefore } from 'date-fns';
import { AvailableDate } from 'src/visa-website/contracts';

export function shouldReschedule(
  currentAppointmentDate: Date,
  availableDates: AvailableDate[],
): boolean {
  const earlierAvailableDate = availableDates.find((availableDate) =>
    isBefore(availableDate.date, currentAppointmentDate),
  );
  if (!earlierAvailableDate) return false;

  return (
    earlierAvailableDate.date.getDate() !== currentAppointmentDate.getDate()
  );
}
