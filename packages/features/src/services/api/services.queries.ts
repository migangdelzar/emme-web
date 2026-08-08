import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@emme/core';
import type { Service as ContractService } from '@emme/api';
import { createMutationOptions, createResourceKey } from '../../shared/queryFactory';

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

const SERVICES_KEY = createResourceKey('services');

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
  const api = useApi();
  const params: ServiceListParams = { category };

  return useQuery<ServiceListResponse>({
    queryKey: [...SERVICES_KEY, 'list', params],
    queryFn: async () => ({
      services: (await api.services.list(params)).map(mapContractService),
    }),
  });
}

export function useCreateService() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation(
    createMutationOptions(
      {
        key: 'services',
        mutationFn: (input: CreateServiceInput) =>
          api.services.create({
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
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation(
    createMutationOptions(
      {
        key: 'services',
        mutationFn: ({ id, ...data }: UpdateServiceInput) =>
          api.services.update(id, {
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
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation(
    createMutationOptions(
      { key: 'services', mutationFn: (id: string) => api.services.retire(id) },
      queryClient
    )
  );
}
