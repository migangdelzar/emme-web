import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getApiClient } from './apiClientInstance';
import type { CurrentUser, HealthResponse } from '@emme/contracts';

export function useHealth() {
  return useQuery<HealthResponse>({
    queryKey: ['health'],
    queryFn: () => getApiClient().getHealth(),
    refetchInterval: 30_000,
  });
}

export function useCurrentUser() {
  const { user, tenant } = useAuth();
  return useQuery<CurrentUser>({
    queryKey: ['currentUser'],
    queryFn: () => {
      if (!user) throw new Error('Not authenticated');
      return Promise.resolve(user);
    },
    initialData: user ?? undefined,
    enabled: !!tenant && !!user,
  });
}
