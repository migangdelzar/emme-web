import { Badge, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@emme/ui';
import type { Appointment } from '../../domain/appointment.types.js';
import { AppointmentDateTime } from './AppointmentDateTime.js';

export interface AppointmentSummaryCardProps {
  readonly appointment: Appointment | null;
  readonly customerName?: string;
  readonly serviceName?: string;
  readonly statusLabel: string;
  readonly loading?: boolean;
}

export function AppointmentSummaryCard({
  appointment,
  customerName = 'Customer',
  serviceName = 'Service',
  statusLabel,
  loading = false,
}: AppointmentSummaryCardProps) {
  if (loading || !appointment) {
    return (
      <Card role="status" aria-label="Loading appointment">
        <CardContent className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <span>{statusLabel}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{customerName}</CardTitle>
        <Badge data-status={appointment.status}>{statusLabel}</Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        <p>{serviceName}</p>
        <AppointmentDateTime
          date={appointment.date}
          startTime={appointment.startTime}
          endTime={appointment.endTime}
        />
      </CardContent>
    </Card>
  );
}
