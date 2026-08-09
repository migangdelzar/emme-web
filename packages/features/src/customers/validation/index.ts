import type { Customer } from '../domain/index.js';
export interface CustomerInputIssue { readonly field: keyof Customer; readonly message: string; }
export function validateCustomerInput(value: Customer): CustomerInputIssue[] {
  const issues: CustomerInputIssue[] = [];
  if (!value.name.trim()) issues.push({ field: 'name', message: 'Name is required' });
  if (!value.phone.trim()) issues.push({ field: 'phone', message: 'Phone is required' });
  return issues;
}
