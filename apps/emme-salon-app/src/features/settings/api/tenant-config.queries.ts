import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/restClient';

export interface BusinessProfile {
  tenantId: string;
  businessName: string | null;
  ownerName: string | null;
  monthlyGoal: string | null;
  workingHours: string | null;
  language: string | null;
  notificationsEnabled: boolean;
}

export interface BusinessHours {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  isActive: boolean;
}

export interface BusinessPolicy {
  cancellationNoticeMinutes?: number;
  maxAdvanceBookingDays?: number;
}

export function useBusinessProfile() {
  return useQuery<BusinessProfile>({
    queryKey: ['businessProfile'],
    queryFn: () => api.get<BusinessProfile>('/api/business-config/profile'),
    retry: false, // 404 expected for new tenants — don't spam retries
  });
}

export function useBusinessHours() {
  return useQuery<BusinessHours[]>({
    queryKey: ['businessHours'],
    queryFn: () => api.get<BusinessHours[]>('/api/business-config/hours'),
  });
}

export function useBusinessPolicy() {
  return useQuery<BusinessPolicy>({
    queryKey: ['businessPolicy'],
    queryFn: () => api.get<BusinessPolicy>('/api/business-config/policy'),
  });
}
