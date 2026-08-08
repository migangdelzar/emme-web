import type { Service } from '@emme/api';

export interface ServiceStatusUpdate {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  description?: string;
  priceRange: string;
  isActive: boolean;
}

export function toggleServiceStatusInput(service: Service): ServiceStatusUpdate {
  return {
    id: service.id,
    name: service.name,
    category: service.category,
    durationMinutes: service.duration,
    description: service.description,
    priceRange: String(service.price),
    isActive: !service.isActive,
  };
}
