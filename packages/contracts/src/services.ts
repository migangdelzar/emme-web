import type { HttpClient } from "@emme/api-client";
import { API } from "./routes.js";

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // minutes
  category: string;
  isActive: boolean;
  description?: string;
}

/** Input shape for creating a service (no id, no isActive). */
export type CreateService = Omit<Service, "id" | "isActive">;

export const SERVICE_ROUTES = {
  SERVICES: "/api/v1/services",
  ARTISTS: "/api/v1/artists",
} as const;

export interface ServiceApi {
  list(): Promise<Service[]>;
  create(data: CreateService): Promise<Service>;
  getById(id: string): Promise<Service>;
  update(id: string, data: Partial<Service>): Promise<Service>;
  retire(id: string): Promise<void>;
}

export function createServiceApi(http: HttpClient): ServiceApi {
  const mapService = (raw: any): Service => ({
    id: raw.id,
    name: raw.name,
    price: raw.basePrice ?? raw.price ?? 0,                  // real API: basePrice, mock: price
    duration: raw.durationMinutes ?? raw.duration ?? 0,       // real API: durationMinutes, mock: duration
    category: raw.category ?? '',
    isActive: raw.isActive ?? (raw.status === 'ACTIVE'),      // mock: isActive, real API: status
    description: raw.description ?? undefined,
  });

  return {
    list: async () => {
      const arr = await http.get<any[]>(API.SERVICES);
      return (arr || []).map(mapService);
    },
    create: async (data) => {
      const body = {
        name: data.name,
        category: data.category,
        basePrice: data.price,
        durationMinutes: data.duration,
        description: data.description || '',
      };
      const raw = await http.post<any>(API.SERVICES, body);
      return mapService(raw);
    },
    getById: async (id) => {
      const raw = await http.get<any>(`${API.SERVICES}/${id}`);
      return mapService(raw);
    },
    update: async (id, data) => {
      const raw = await http.put<any>(`${API.SERVICES}/${id}`, data);
      return mapService(raw);
    },
    retire: (id) => http.post<void>(`${API.SERVICES}/${id}/retire`),
  };
}
