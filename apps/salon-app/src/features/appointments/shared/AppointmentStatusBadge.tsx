import { Badge } from '@emme/ui';

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface AppointmentStatusBadgeProps {
  readonly status: AppointmentStatus;
  readonly label: string;
}

export function AppointmentStatusBadge({ status, label }: AppointmentStatusBadgeProps) {
  const variant =
    status === 'cancelled' ? 'destructive' : status === 'completed' ? 'secondary' : 'default';

  return (
    <Badge data-status={status} variant={variant}>
      {label}
    </Badge>
  );
}
