import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/restClient';
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
  return useQuery<ServiceListResponse>({
    queryKey: ['services', { category }],
    queryFn: async () => ({
      services: (await api.get<ServiceApiResponse[]>(
        '/api/v1/services',
        category ? { category } : undefined,
      )).map(mapServiceApiResponse),
    }),
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateServiceInput) => api.post<ServiceApiResponse>(
      '/api/v1/services',
      {
        code: serviceCode(input.name),
        name: input.name,
        category: input.category,
        description: input.description,
        durationMinutes: input.durationMinutes,
        basePrice: Number(input.priceRange ?? 0),
      },
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateServiceInput) => api.put<ServiceApiResponse>(
      `/api/v1/services/${id}`,
      {
        name: data.name,
        category: data.category,
        description: data.description,
        durationMinutes: data.durationMinutes,
        basePrice: Number(data.priceRange ?? 0),
      },
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/api/v1/services/${id}/retire`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}
