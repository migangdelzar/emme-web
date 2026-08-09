import type { Service } from '../domain/index.js';

export interface CatalogInputIssue { readonly field: keyof Service; readonly message: string; }

export function validateCatalogService(service: Service): CatalogInputIssue[] {
  const issues: CatalogInputIssue[] = [];
  if (!service.name.trim()) issues.push({ field: 'name', message: 'Name is required' });
  if (service.price < 0) issues.push({ field: 'price', message: 'Price cannot be negative' });
  if (service.durationMinutes <= 0) issues.push({ field: 'durationMinutes', message: 'Duration must be positive' });
  return issues;
}
