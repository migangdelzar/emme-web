import { test, expect } from '@fixtures/testWithUser';
import { Tag } from '../../shared/tags';
import { AppointmentsPage } from '@pages/AppointmentsPage';
import { t } from '@emme/i18n';

const todayStr = new Date().toISOString().split('T')[0];

const mockApps = [
  { id: 'apt-1', clientId: 'c1', serviceId: 'svc-1', date: todayStr, startTime: '10:00', endTime: '11:00', status: 'confirmed' as const },
  { id: 'apt-2', clientId: 'c2', serviceId: 'svc-2', date: todayStr, startTime: '12:00', endTime: '13:30', status: 'confirmed' as const },
  { id: 'apt-3', clientId: 'c3', serviceId: 'svc-1', date: todayStr, startTime: '14:00', endTime: '15:00', status: 'confirmed' as const },
];

const mockCustomers = [
  { id: 'c1', name: 'Elena Garcia', phone: '555-0101', email: 'elena@test.com' },
  { id: 'c2', name: 'Valeria Arriaza', phone: '555-0102', email: 'valeria@test.com' },
  { id: 'c3', name: 'Maria Lopez', phone: '555-0103', email: 'maria@test.com' },
];

const mockServices = [
  { id: 'svc-1', name: 'Manicure Rusa', category: 'Manicura', duration: 60, price: 750, isActive: true },
  { id: 'svc-2', name: 'Soft Gel Premium', category: 'Extensiones', duration: 90, price: 1200, isActive: true },
];

test.describe('Appointments Page', { tag: [Tag.APPOINTMENTS, Tag.REGRESSION] }, () => {
  test.beforeEach(async ({ authenticatedPage, provider }) => {
    await provider.seed({ appointments: mockApps, customers: mockCustomers, services: mockServices });
    const appointments = new AppointmentsPage(authenticatedPage);
    await appointments.goto();
    await expect(appointments.header()).toBeVisible();
  });

  test('page header renders', { tag: [Tag.SMOKE] }, async ({ authenticatedPage }) => {
    const appointments = new AppointmentsPage(authenticatedPage);
    await expect(appointments.header()).toBeVisible();
  });

  test('date strip navigation visible', async ({ authenticatedPage }) => {
    const appointments = new AppointmentsPage(authenticatedPage);
    await expect(appointments.dateStrip()).toBeVisible();
  });

  test('projected income card shows', async ({ authenticatedPage }) => {
    const appointments = new AppointmentsPage(authenticatedPage);
    await expect(appointments.todayAppointmentsSummary()).toBeVisible();
  });

  test('new appointment form opens via add=true', { tag: [Tag.HAPPY_PATH] }, async ({ authenticatedPage }) => {
    const appointments = new AppointmentsPage(authenticatedPage);
    await appointments.gotoNewAppointment();
    await expect(appointments.stepIndicator()).toBeVisible();
  });
});
