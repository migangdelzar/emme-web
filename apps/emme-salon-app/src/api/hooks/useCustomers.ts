import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/restClient';
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
  return useQuery<CustomerListResponse>({
    queryKey: ['customers'],
    queryFn: async () => ({
      customers: (await api.get<CustomerApiResponse[]>('/api/v1/customers'))
        .map(mapCustomerApiResponse),
    }),
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCustomerInput) =>
      api.post<Customer>('/api/v1/customers', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateCustomerInput) =>
      api.put<Customer>(`/api/v1/customers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/api/v1/customers/${id}/retire`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}
