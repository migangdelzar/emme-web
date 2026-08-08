import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('appointments feature package integration', () => {
  it('uses the reusable appointment status capability', () => {
    const source = readFileSync('src/appointments/components/Appointments.tsx', 'utf8');

    expect(source).toContain("from '@emme/features'");
    expect(source).toContain('AppointmentStatusBadge');
  });
});
