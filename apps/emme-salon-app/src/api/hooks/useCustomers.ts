import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/restClient';
import { createMutationOptions, createQueryResource, createResourceKey } from '@/api/queryFactory';
import { mapCustomerApiResponse, type CustomerApiResponse } from './salonApiAdapters';

export interface Customer {
  id: string;
  tenantId?: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  allergies?: string | null;
  preferences?: string | null;
  isVip?: boolean;
  birthday?: string | null;
}

interface CustomerListResponse {
  customers: Customer[];
}

const CUSTOMERS_KEY = createResourceKey('customers');

const customersResource = createQueryResource<undefined, CustomerListResponse, 'customers'>({
  key: 'customers',
  queryKey: () => [...CUSTOMERS_KEY, 'list'],
  queryFn: async () => ({
    customers: (await api.get<CustomerApiResponse[]>('/api/customers'))
      .map(mapCustomerApiResponse),
  }),
});

export interface CreateCustomerInput {
  name: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  allergies?: string | null;
  preferences?: string | null;
  isVip?: boolean;
  birthday?: string | null;
}

export interface UpdateCustomerInput extends CreateCustomerInput {
  id: string;
}

export function useCustomers() {
  return useQuery(customersResource.listOptions(undefined));
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation(createMutationOptions({
    key: 'customers',
    mutationFn: (input: CreateCustomerInput) =>
      api.post<Customer>('/api/customers', input),
  }, queryClient));
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation(createMutationOptions({
    key: 'customers',
    mutationFn: ({ id, ...data }: UpdateCustomerInput) =>
      api.put<Customer>(`/api/customers/${id}`, data),
  }, queryClient));
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation(createMutationOptions({
    key: 'customers',
    mutationFn: (id: string) => api.post(`/api/customers/${id}/retire`),
  }, queryClient));
}
