import { test, expect } from '@fixtures/testWithUser';
import { Tag } from '../../shared/tags';
import { AppointmentsPage } from '@pages/AppointmentsPage';

const mockCustomers = [
  { id: 'ac1', name: 'Elena Garcia', email: 'elena@test.com', phone: '555-0101' },
  { id: 'ac2', name: 'Valeria Arriaza', email: 'valeria@test.com', phone: '555-0102' },
  { id: 'ac3', name: 'Maria Lopez', email: 'mlopez@test.com', phone: '555-0103' },
];

const mockServices = [
  { id: 'as1', name: 'Manicure Rusa', category: 'Manicura y Cuidado Natural', duration: 90, price: 750, isActive: true },
  { id: 'as2', name: 'Soft Gel Premium', category: 'Extensiones y Estructura', duration: 120, price: 1200, isActive: true },
];

const mockAppointments = [
  { id: 'apt-1', clientId: 'ac1', serviceId: 'as1', date: new Date().toISOString().split('T')[0], startTime: '10:00', endTime: '11:00', status: 'confirmed' as const },
  { id: 'apt-2', clientId: 'ac2', serviceId: 'as2', date: new Date().toISOString().split('T')[0], startTime: '11:00', endTime: '12:00', status: 'confirmed' as const },
  { id: 'apt-3', clientId: 'ac3', serviceId: 'as1', date: new Date().toISOString().split('T')[0], startTime: '12:00', endTime: '13:00', status: 'confirmed' as const },
];

test.describe('Appointments', { tag: [Tag.APPOINTMENTS, Tag.REGRESSION] }, () => {
  test.beforeEach(async ({ authenticatedPage, provider }) => {
    await provider.seed({ appointments: mockAppointments, customers: mockCustomers, services: mockServices });
    const appointments = new AppointmentsPage(authenticatedPage);
    await appointments.goto();
    await expect(appointments.header()).toBeVisible();
  });

  test('page renders all components', { tag: [Tag.SMOKE] }, async ({ authenticatedPage }) => {
    const appointments = new AppointmentsPage(authenticatedPage);
    await appointments.goto();
    await expect(appointments.header()).toBeVisible();
    await expect(appointments.dateStrip()).toBeVisible();
    await expect(appointments.todayAppointmentsSummary()).toBeVisible();
  });

  test('new appointment form opens via add=true', { tag: [Tag.HAPPY_PATH] }, async ({ authenticatedPage }) => {
    const appointments = new AppointmentsPage(authenticatedPage);
    await appointments.gotoNewAppointment();
    await expect(appointments.stepIndicator()).toBeVisible();
  });
});
