import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/restClient';
import { createClientApi, type Client as ContractClient } from '@emme/api';
import { createClient } from '@emme/application';
import { createClientRepository } from '@emme/infrastructure';
import { createMutationOptions, createQueryResource, createResourceKey } from '@/api/queryFactory';

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

const customersContract = createClientApi(api);
const clientRepository = createClientRepository(api);
const createClientUseCase = createClient({ clients: clientRepository });

function mapContractCustomer(raw: ContractClient): Customer {
  return raw;
}

const CUSTOMERS_KEY = createResourceKey('customers');

const customersResource = createQueryResource<undefined, CustomerListResponse, 'customers'>({
  key: 'customers',
  queryKey: () => [...CUSTOMERS_KEY, 'list'],
  queryFn: async () => ({
    customers: (await customersContract.list()).map(mapContractCustomer),
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
  const queryClient = useQueryClient();
  return useMutation(
    createMutationOptions(
      {
        key: 'customers',
        mutationFn: ({ id, ...data }: UpdateCustomerInput) => customersContract.update(id, data),
      },
      queryClient
    )
  );
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation(
    createMutationOptions(
      {
        key: 'customers',
        mutationFn: (id: string) => customersContract.retire(id),
      },
      queryClient
    )
  );
}
