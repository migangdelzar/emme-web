import type { Service } from './service.types.js';

export function calculateServiceTotal(price: number, quantity = 1): number {
  if (!Number.isFinite(price) || price < 0) {
    throw new Error('Service price must be non-negative');
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('Service quantity must be positive');
  }

  return price * quantity;
}

export function isServiceBookable(service: Service): boolean {
  return service.isActive && Number.isInteger(service.durationMinutes) && service.durationMinutes > 0;
}
