import { createCustomer, type Customer } from '../domain/index.js';
import type { CustomerRepository } from './ports.js';
export function createCustomerOperations(repository: CustomerRepository) {
  return {
    listCustomers: (tenantId: string) => repository.list(tenantId),
    getCustomer: async (id: string) => {
      const value = await repository.findById(id);
      if (!value) throw new Error('Customer not found');
      return value;
    },
    createCustomer: (value: Customer) => repository.save(createCustomer(value)),
    updateCustomer: (value: Customer) => repository.save(createCustomer(value)),
    retireCustomer: async (id: string) => repository.retire(id),
  };
}
