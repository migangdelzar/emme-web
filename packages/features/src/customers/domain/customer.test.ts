import { describe, expect, it } from 'vitest';
import { assertCustomerTenant, createCustomer } from './index.js';
const customer = { id: 'customer-1', tenantId: 'tenant-1', name: 'Ada', phone: '555-0100', isActive: true };
describe('customer domain', () => {
  it('requires name, phone, and tenant', () => {
    expect(() => createCustomer({ ...customer, name: '' })).toThrow(/name/i);
    expect(() => createCustomer({ ...customer, phone: '' })).toThrow(/phone/i);
  });
  it('enforces tenant ownership', () => {
    expect(() => assertCustomerTenant(customer, 'tenant-1')).not.toThrow();
    expect(() => assertCustomerTenant(customer, 'tenant-2')).toThrow();
  });
});
