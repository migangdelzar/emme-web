export interface AppointmentInput {
  readonly clientId: string;
  readonly serviceId: string;
  readonly date: string;
  readonly startTime: string;
  readonly endTime: string;
}

export interface AppointmentInputIssue {
  readonly field: keyof AppointmentInput;
  readonly message: string;
}

export function validateAppointmentInput(input: AppointmentInput): AppointmentInputIssue[] {
  const issues: AppointmentInputIssue[] = [];
  if (!input.clientId.trim()) issues.push({ field: 'clientId', message: 'Client is required' });
  if (!input.serviceId.trim()) issues.push({ field: 'serviceId', message: 'Service is required' });
  if (!input.date.trim()) issues.push({ field: 'date', message: 'Date is required' });
  if (!input.startTime.trim()) issues.push({ field: 'startTime', message: 'Start time is required' });
  if (!input.endTime.trim()) issues.push({ field: 'endTime', message: 'End time is required' });
  if (input.startTime >= input.endTime) {
    issues.push({ field: 'endTime', message: 'End time must be after start time' });
  }
  return issues;
}
