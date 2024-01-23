import { isBefore } from 'date-fns';

export function getDateToReschedule(
  currentAppointmentDate: Date,
  availableDates: Date[],
): Date | null {
  const earlierAvailableDate = availableDates.find((availableDate) =>
    isBefore(availableDate, currentAppointmentDate),
  );
  if (!earlierAvailableDate) return null;

  const isSameDay =
    earlierAvailableDate.getDate() === currentAppointmentDate.getDate();

  if (isSameDay) return null;

  return earlierAvailableDate;
}
