import type { Service } from '@/context/AppContext';

export interface ServiceViewInput {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  description?: string | null;
  priceRange?: string | null;
  isActive?: boolean;
}

export function mapNailServiceView(raw: ServiceViewInput): Service {
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
