import { isBefore } from 'date-fns';
import { AvailableDate } from 'src/visa-website/contracts';

export function getDateToReschedule(
  currentAppointmentDate: Date,
  availableDates: AvailableDate[],
): Date | null {
  const earlierAvailableDate = availableDates.find((availableDate) =>
    isBefore(availableDate.date, currentAppointmentDate),
  );
  if (!earlierAvailableDate) return null;

  const isSameDay =
    earlierAvailableDate.date.getDate() === currentAppointmentDate.getDate();

  if (isSameDay) return null;

  return earlierAvailableDate.date;
}
