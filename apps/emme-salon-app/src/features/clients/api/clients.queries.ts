import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@emme/core';
import type { Client as ContractClient } from '@emme/api';
import { createClient, updateClient } from '@emme/application';
import { createClientRepository } from '@emme/infrastructure';
import { createMutationOptions, createResourceKey } from '@/api/queryFactory';

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

function mapContractCustomer(raw: ContractClient): Customer {
  return raw;
}

const CUSTOMERS_KEY = createResourceKey('customers');

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
  const api = useApi();

  return useQuery<CustomerListResponse>({
    queryKey: [...CUSTOMERS_KEY, 'list'],
    queryFn: async () => ({
      customers: (await api.clients.list()).map(mapContractCustomer),
    }),
  });
}

export function useCreateCustomer() {
  const api = useApi();
  const queryClient = useQueryClient();
  const createClientUseCase = useMemo(
    () => createClient({ clients: createClientRepository(api.clients) }),
    [api]
  );

  return useMutation(
    createMutationOptions(
      {
        key: 'customers',
        mutationFn: (input: CreateCustomerInput) =>
          createClientUseCase({
            name: input.name,
            phone: input.phone ?? '',
            email: input.email ?? undefined,
            notes: input.notes ?? undefined,
            allergies: input.allergies ?? undefined,
            preferences: input.preferences ?? undefined,
            isVip: input.isVip,
            birthday: input.birthday ?? undefined,
          }),
      },
      queryClient
    )
  );
}

export function useUpdateCustomer() {
  const api = useApi();
  const queryClient = useQueryClient();
  const updateClientUseCase = useMemo(
    () => updateClient({ clients: createClientRepository(api.clients) }),
    [api]
  );

  return useMutation(
    createMutationOptions(
      {
        key: 'customers',
        mutationFn: ({ id, ...data }: UpdateCustomerInput) =>
          updateClientUseCase({
            id,
            input: {
              name: data.name,
              phone: data.phone ?? undefined,
              email: data.email ?? undefined,
              notes: data.notes ?? undefined,
              allergies: data.allergies ?? undefined,
              preferences: data.preferences ?? undefined,
              isVip: data.isVip,
              birthday: data.birthday ?? undefined,
            },
          }),
      },
      queryClient
    )
  );
}

export function useDeleteCustomer() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation(
    createMutationOptions(
      {
        key: 'customers',
        mutationFn: (id: string) => api.clients.retire(id),
      },
      queryClient
    )
  );
}
