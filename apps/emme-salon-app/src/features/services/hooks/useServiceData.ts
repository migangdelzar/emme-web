import { useMemo, useCallback } from 'react';
import {
  useNailServicesRest,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from '@/features/services/api/services.queries';
import type { Service } from '@emme/api';
import { toggleServiceStatusInput } from '@/features/services/domain/service.rules';

function mapNailServiceView(raw: {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  description?: string | null;
  priceRange?: string | null;
  isActive?: boolean;
}): Service {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description || '',
    price: parseInt(raw.priceRange || '0', 10) || 0,
    duration: raw.durationMinutes || 0,
    category: raw.category || '',
    isActive: raw.isActive ?? true,
  };
}

export function useServiceData() {
  const { data, isLoading, error } = useNailServicesRest();
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();

  const services: Service[] = useMemo(() => (data?.services || []).map(mapNailServiceView), [data]);

  const addService = useCallback(
    async (service: {
      name: string;
      category: string;
      duration: number;
      description: string;
      price: number;
    }) => {
      await createMutation.mutateAsync({
        name: service.name,
        category: service.category,
        durationMinutes: service.duration,
        description: service.description,
        priceRange: String(service.price),
      });
    },
    [createMutation]
  );

  const updateService = useCallback(
    async (
      id: string,
      service: {
        name: string;
        category: string;
        duration: number;
        description: string;
        price: number;
      }
    ) => {
      await updateMutation.mutateAsync({
        id,
        name: service.name,
        category: service.category,
        durationMinutes: service.duration,
        description: service.description,
        priceRange: String(service.price),
      });
    },
    [updateMutation]
  );

  const deleteService = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation]
  );

  const toggleServiceStatus = useCallback(
    async (id: string) => {
      const service = services.find((candidate) => candidate.id === id);
      if (!service) return;

      await updateMutation.mutateAsync(toggleServiceStatusInput(service));
    },
    [services, updateMutation]
  );

  return {
    loading: isLoading,
    error: error?.message || null,
    services,
    addService,
    updateService,
    deleteService,
    toggleServiceStatus,
  };
}
