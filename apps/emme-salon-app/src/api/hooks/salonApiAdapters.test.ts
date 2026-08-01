import { describe, expect, it } from 'vitest';
import {
  mapAppointmentApiResponse,
  mapCustomerApiResponse,
  mapServiceApiResponse,
} from './salonApiAdapters';

describe('salon REST API adapters', () => {
  it('maps backend appointment fields to the existing frontend contract', () => {
    expect(mapAppointmentApiResponse({
      id: 'apt-1',
      customerId: 'customer-1',
      customerName: 'Alice',
      serviceId: 'service-1',
      serviceName: 'Gel',
      artistId: 'artist-1',
      artistName: 'Ana',
      startsAt: '2026-07-06T09:00:00Z',
      endsAt: '2026-07-06T10:00:00Z',
      status: 'CONFIRMED',
    })).toMatchObject({
      clientId: 'customer-1',
      startTime: '2026-07-06T09:00:00Z',
      endTime: '2026-07-06T10:00:00Z',
    });
  });

  it('maps backend service price and status while preserving catalog fields', () => {
    expect(mapServiceApiResponse({
      id: 'svc-1',
      code: 'GEL',
      name: 'Gel',
      category: 'Nail Art',
      description: 'Art',
      durationMinutes: 60,
      basePrice: 500,
      status: 'ACTIVE',
    })).toMatchObject({
      priceRange: '500',
      isActive: true,
      category: 'Nail Art',
      description: 'Art',
    });
  });

  it('preserves customer fields from the backend array response', () => {
    expect(mapCustomerApiResponse({
      id: 'customer-1',
      name: 'Alice',
      phone: '555-0001',
      email: 'alice@example.com',
      status: 'ACTIVE',
    })).toEqual({
      id: 'customer-1',
      name: 'Alice',
      phone: '555-0001',
      email: 'alice@example.com',
    });
  });

  it('rejects malformed customer transport payloads', () => {
    expect(() => mapCustomerApiResponse({ name: 'Alice' })).toThrow(
      'Invalid customer response: id must be a string',
    );
  });
});
