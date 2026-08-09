import type { Customer } from '../domain/index.js';
export interface CustomerRepository {
  list(tenantId: string): Promise<Customer[]>;
  findById(id: string): Promise<Customer | null>;
  save(customer: Customer): Promise<Customer>;
  retire(id: string): Promise<void>;
}
