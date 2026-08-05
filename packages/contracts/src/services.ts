import { API } from "./routes.js";
import {
  asRecord,
  asRecordArray,
  booleanField,
  firstBooleanField,
  firstNumberField,
  firstStringField,
  optionalStringField,
  stringField,
  type HttpClient,
} from "./transport.js";

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
  SERVICES: "/api/services",
  ARTISTS: "/api/artists",
} as const;

export interface ServiceApi {
  list(params?: { category?: string }): Promise<Service[]>;
  create(data: CreateService): Promise<Service>;
  getById(id: string): Promise<Service>;
  update(id: string, data: Partial<Service>): Promise<Service>;
  retire(id: string): Promise<void>;
}

export function createServiceApi(http: HttpClient): ServiceApi {
  const mapService = (payload: unknown): Service => {
    const raw = asRecord(payload, "service");
    return {
      id: stringField(raw, "id", "service"),
      name: stringField(raw, "name", "service"),
      price: firstNumberField(raw, ["basePrice", "price"]),
      duration: firstNumberField(raw, ["durationMinutes", "duration"]),
      category: firstStringField(raw, ["category"]),
      isActive: firstBooleanField(raw, ["isActive"], raw.status === 'ACTIVE'),
      description: optionalStringField(raw, "description"),
    };
  };

  return {
    list: async (params) => {
      const arr = await http.get<unknown>(
        API.SERVICES,
        params?.category ? { category: params.category } : undefined,
      );
      return asRecordArray(arr, "service").map((item) => mapService(item));
    },
    create: async (data) => {
      const body = {
        code: data.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36),
        name: data.name,
        category: data.category,
        basePrice: data.price,
        durationMinutes: data.duration,
        description: data.description || '',
      };
      const raw = await http.post<unknown>(API.SERVICES, body);
      return mapService(raw);
    },
    getById: async (id) => {
      const raw = await http.get<unknown>(`${API.SERVICES}/${id}`);
      return mapService(raw);
    },
    update: async (id, data) => {
      const raw = await http.put<unknown>(`${API.SERVICES}/${id}`, data);
      return mapService(raw);
    },
    retire: (id) => http.post<void>(`${API.SERVICES}/${id}/retire`),
  };
}
