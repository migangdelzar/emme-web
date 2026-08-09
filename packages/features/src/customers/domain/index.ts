export interface Customer {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly phone: string;
  readonly email?: string;
  readonly notes?: string;
  readonly isActive: boolean;
}

export class InvalidCustomerError extends Error { readonly code = 'INVALID_CUSTOMER'; }
export class CustomerTenantMismatchError extends Error { readonly code = 'CUSTOMER_TENANT_MISMATCH'; }
export function createCustomer(value: Customer): Customer {
  if (!value.name.trim()) throw new InvalidCustomerError('Customer name is required');
  if (!value.phone.trim()) throw new InvalidCustomerError('Customer phone is required');
  if (!value.tenantId.trim()) throw new InvalidCustomerError('Customer tenant is required');
  return { ...value };
}
export function assertCustomerTenant(customer: Customer, tenantId: string): void {
  if (customer.tenantId !== tenantId) throw new CustomerTenantMismatchError('Customer does not belong to tenant');
}
