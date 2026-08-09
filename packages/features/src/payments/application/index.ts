export type { PaymentRepository, PaymentProvider } from './ports.js';
import type { PaymentRepository } from './ports.js';
export function getPayment(repository: PaymentRepository) { return async (id: string) => { const value = await repository.findById(id); if (!value) throw new Error('Payment not found'); return value; }; }
