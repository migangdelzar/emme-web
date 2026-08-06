import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { provider } from '@/providers/DataProvider';
import { useAuth } from '@/app/auth/useAuth';
import type { CreateClient, CreateService, CreateAppointment } from '@emme/contracts';

// -- Read hooks with caching (only fetch when auth is ready) ---

export function useClients() {
  const { status } = useAuth();
  return useQuery({
    queryKey: ['clients'],
    queryFn: () => provider.loadClients(),
    staleTime: 30_000,
    enabled: status === 'ready',
  });
}

export function useServices() {
  const { status } = useAuth();
  return useQuery({
    queryKey: ['services'],
    queryFn: () => provider.loadServices(),
    staleTime: 30_000,
    enabled: status === 'ready',
  });
}

export function useAppointments() {
  const { status } = useAuth();
  return useQuery({
    queryKey: ['appointments'],
    queryFn: () => provider.loadAppointments(),
    staleTime: 15_000,
    enabled: status === 'ready',
  });
}

// -- Write hooks with cache invalidation ---

export function useAddClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (c: CreateClient) => provider.addClient(c),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  });
}

export function useAddService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (s: CreateService) => provider.addService(s),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  });
}

export function useAddAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (a: CreateAppointment) => provider.addAppointment(a),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });
}
