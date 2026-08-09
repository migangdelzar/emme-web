export type Currency = 'MXN' | 'USD';
export interface Money { readonly amountMinor: number; readonly currency: Currency; }
export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'refunded' | 'failed';
export interface Payment { readonly id: string; readonly tenantId: string; readonly amount: Money; readonly status: PaymentStatus; readonly operationKey: string; }
export class InvalidMoneyError extends Error { readonly code = 'INVALID_MONEY'; }
export function createMoney(amountMinor: number, currency: Currency): Money { if (!Number.isInteger(amountMinor) || amountMinor < 0) throw new InvalidMoneyError('Amount must be non-negative minor units'); return { amountMinor, currency }; }
export function addMoney(first: Money, second: Money): Money { if (first.currency !== second.currency) throw new InvalidMoneyError('Currency mismatch'); return createMoney(first.amountMinor + second.amountMinor, first.currency); }
export function isRefundable(payment: Payment): boolean { return payment.status === 'captured'; }
