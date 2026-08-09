import type { PaymentStatus } from '../domain/index.js';
export function PaymentStatusBadge({ status }: { readonly status: PaymentStatus }) { return <span data-status={status}>{status}</span>; }
export function PaymentSummary({ amountMinor, currency }: { readonly amountMinor: number; readonly currency: string }) { return <p>{(amountMinor / 100).toFixed(2)} {currency}</p>; }
