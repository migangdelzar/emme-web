import { asRecord, firstNumberField, stringField } from '@emme/api';
import { createMoney, type Currency, type Payment, type PaymentStatus } from '../domain/index.js';

function parseCurrency(value: string): Currency {
  if (value === 'MXN' || value === 'USD') return value;
  throw new Error(`Invalid payment currency: ${value}`);
}

function parsePaymentStatus(value: string): PaymentStatus {
  if (value === 'pending' || value === 'authorized' || value === 'captured' || value === 'refunded' || value === 'failed') return value;
  throw new Error(`Invalid payment status: ${value}`);
}

export function mapPaymentPayload(payload: unknown): Payment {
  const raw = asRecord(payload, 'payment');
  const currency = parseCurrency(stringField(raw, 'currency', 'payment'));
  const status = parsePaymentStatus(stringField(raw, 'status', 'payment'));
  return {
    id: stringField(raw, 'id', 'payment'),
    tenantId: stringField(raw, 'tenantId', 'payment'),
    amount: createMoney(firstNumberField(raw, ['amountMinor', 'amount']), currency),
    status,
    operationKey: stringField(raw, 'operationKey', 'payment'),
  };
}
