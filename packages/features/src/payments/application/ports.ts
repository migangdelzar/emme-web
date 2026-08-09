import type { Payment } from '../domain/index.js';
export interface PaymentRepository { save(payment: Payment): Promise<Payment>; findById(id: string): Promise<Payment | null>; }
export interface PaymentProvider { createIntent(payment: Payment): Promise<{ providerId: string; status: Payment['status'] }>; refund(payment: Payment): Promise<void>; }
