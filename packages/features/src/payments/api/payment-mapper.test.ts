import { describe, expect, it } from 'vitest';
import { mapPaymentPayload } from './index.js';

const payload = {
  id: 'payment-1',
  tenantId: 'tenant-1',
  amountMinor: 1000,
  currency: 'MXN',
  status: 'captured',
  operationKey: 'op-1',
};

describe('mapPaymentPayload', () => {
  it('rejects unsupported currency and status values', () => {
    expect(() => mapPaymentPayload({ ...payload, currency: 'BTC' })).toThrow(/currency/i);
    expect(() => mapPaymentPayload({ ...payload, status: 'unknown' })).toThrow(/status/i);
  });
});
