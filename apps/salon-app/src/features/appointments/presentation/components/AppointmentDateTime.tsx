import { format, parseISO } from 'date-fns';

export interface AppointmentDateTimeProps {
  readonly date: string;
  readonly startTime: string;
  readonly endTime: string;
}

export function AppointmentDateTime({ date, startTime, endTime }: AppointmentDateTimeProps) {
  const dateLabel = format(parseISO(date), 'PPP');
  return (
    <time dateTime={`${date}T${startTime}`} aria-label="Appointment time">
      {dateLabel} · {startTime}–{endTime}
    </time>
  );
}
