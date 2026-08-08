import { useQuery } from '@tanstack/react-query';
import { useApi } from '@emme/core';
import type { BusinessHours, BusinessPolicy, BusinessProfile } from '@emme/api';

export type { BusinessHours, BusinessPolicy, BusinessProfile } from '@emme/api';

export function useBusinessProfile() {
  const api = useApi();
  return useQuery<BusinessProfile>({
    queryKey: ['businessProfile'],
    queryFn: () => api.businessConfig.profile(),
    retry: false, // 404 expected for new tenants — don't spam retries
  });
}

export function useBusinessHours() {
  const api = useApi();
  return useQuery<BusinessHours[]>({
    queryKey: ['businessHours'],
    queryFn: () => api.businessConfig.hours(),
  });
}

export function useBusinessPolicy() {
  const api = useApi();
  return useQuery<BusinessPolicy>({
    queryKey: ['businessPolicy'],
    queryFn: () => api.businessConfig.policy(),
  });
}
