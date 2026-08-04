import { useMemo } from 'react';
import { useAuth } from '@/auth/useAuth';
import { useNailServicesRest } from '@/api/hooks/useServices';
import { useBusinessProfile } from '@/api/hooks/useTenantConfig';
import type { BusinessProfile as ProfileType } from '@/api/hooks/useTenantConfig';

function mapNailServiceView(raw: {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  description?: string | null;
  priceRange?: string | null;
}) {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description || '',
    price: parseInt(raw.priceRange || '0', 10) || 0,
    duration: raw.durationMinutes || 0,
    category: raw.category || '',
    isActive: true,
  };
}

export function useSettingsData() {
  const { user, tenant, profile } = useAuth();
  const { data: svcData, isLoading: svcLoading, error: svcError } = useNailServicesRest();
  const { data: bizProfile, isLoading: bizLoading } = useBusinessProfile();

  const services = useMemo(() => (svcData?.services || []).map(mapNailServiceView), [svcData]);

  return {
    loading: svcLoading || bizLoading,
    error: svcError?.message || null,
    profile: {
      owner: bizProfile?.ownerName || profile?.ownerName || user?.displayName || '',
      email: user?.email || '',
      businessName:
        bizProfile?.businessName ||
        profile?.businessName ||
        tenant?.tenantName ||
        tenant?.tenantSlug ||
        '',
      monthlyGoal: bizProfile?.monthlyGoal || profile?.monthlyGoal || null,
      language: bizProfile?.language || profile?.language || null,
      workingHours: (bizProfile?.workingHours || profile?.workingHours) ?? undefined,
      notificationsEnabled:
        bizProfile?.notificationsEnabled ?? profile?.notificationsEnabled ?? false,
    },
    services,
  };
}
