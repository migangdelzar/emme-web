import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/restClient';
import { createServiceApi, type Service as ContractService } from '@emme/api';
import { createMutationOptions, createQueryResource, createResourceKey } from '@/api/queryFactory';

export interface NailService {
  id: string;
  code?: string;
  name: string;
  category: string;
  durationMinutes: number;
  description?: string | null;
  priceRange?: string | null;
  isActive?: boolean;
}

interface ServiceListResponse {
  services: NailService[];
}

interface ServiceListParams {
  category?: string;
}

const servicesContract = createServiceApi(api);

function mapContractService(raw: ContractService): NailService {
  return {
    id: raw.id,
    name: raw.name,
    category: raw.category,
    durationMinutes: raw.duration,
    description: raw.description ?? null,
    priceRange: String(raw.price),
    isActive: raw.isActive,
  };
}

const SERVICES_KEY = createResourceKey('services');

const servicesResource = createQueryResource<ServiceListParams, ServiceListResponse, 'services'>({
  key: 'services',
  queryKey: (params) => [...SERVICES_KEY, 'list', params],
  queryFn: async (params) => ({
    services: (await servicesContract.list(params)).map(mapContractService),
  }),
});

export interface CreateServiceInput {
  name: string;
  category: string;
  durationMinutes: number;
  description?: string;
  priceRange?: string;
}

export interface UpdateServiceInput extends CreateServiceInput {
  id: string;
  isActive?: boolean;
}

export function useNailServicesRest(category?: string) {
  return useQuery(servicesResource.listOptions({ category }));
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation(
    createMutationOptions(
      {
        key: 'services',
        mutationFn: (input: CreateServiceInput) =>
          servicesContract.create({
            name: input.name,
            category: input.category,
            description: input.description,
            duration: input.durationMinutes,
            price: Number(input.priceRange ?? 0),
          }),
      },
      queryClient
    )
  );
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation(
    createMutationOptions(
      {
        key: 'services',
        mutationFn: ({ id, ...data }: UpdateServiceInput) =>
          servicesContract.update(id, {
            name: data.name,
            category: data.category,
            description: data.description,
            duration: data.durationMinutes,
            price: Number(data.priceRange ?? 0),
            isActive: data.isActive,
          }),
      },
      queryClient
    )
  );
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation(
    createMutationOptions(
      {
        key: 'services',
        mutationFn: (id: string) => api.post(`/api/services/${id}/retire`),
      },
      queryClient
    )
  );
}
