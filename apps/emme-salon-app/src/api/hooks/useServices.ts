import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/restClient';
import { createMutationOptions, createQueryResource, createResourceKey } from '@/api/queryFactory';
import { mapServiceApiResponse, serviceCode, type ServiceApiResponse } from './salonApiAdapters';

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

const servicesResource = createQueryResource<ServiceListParams, ServiceListResponse, 'services'>({
  key: 'services',
  queryKey: (params) => [...SERVICES_KEY, 'list', params],
  queryFn: async (params) => ({
    services: (await api.get<ServiceApiResponse[]>(
      '/api/services',
      params.category ? { category: params.category } : undefined,
    )).map(mapServiceApiResponse),
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
}

export function useNailServicesRest(category?: string) {
  return useQuery(servicesResource.listOptions({ category }));
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation(createMutationOptions({
    key: 'services',
    mutationFn: (input: CreateServiceInput) => api.post<ServiceApiResponse>(
      '/api/services',
      {
        code: serviceCode(input.name),
        name: input.name,
        category: input.category,
        description: input.description,
        durationMinutes: input.durationMinutes,
        basePrice: Number(input.priceRange ?? 0),
      },
    ),
  }, queryClient));
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation(createMutationOptions({
    key: 'services',
    mutationFn: ({ id, ...data }: UpdateServiceInput) => api.put<ServiceApiResponse>(
      `/api/services/${id}`,
      {
        name: data.name,
        category: data.category,
        description: data.description,
        durationMinutes: data.durationMinutes,
        basePrice: Number(data.priceRange ?? 0),
      },
    ),
  }, queryClient));
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation(createMutationOptions({
    key: 'services',
    mutationFn: (id: string) => api.post(`/api/services/${id}/retire`),
  }, queryClient));
}
