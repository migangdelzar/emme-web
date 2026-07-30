import type { HttpClient } from "@emme/api-client";
import { API } from "./routes.js";

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  birthday?: string;    // ISO date string
  isVip?: boolean;
  notes?: string;
  preferences?: string;
  allergies?: string;
}

/** Input shape for creating a client (no id). */
export type CreateClient = Omit<Client, "id">;

export const CLIENT_ROUTES = {
  CUSTOMERS: "/api/v1/customers",
} as const;

export interface ClientApi {
  list(): Promise<Client[]>;
  create(data: CreateClient): Promise<Client>;
  getById(id: string): Promise<Client>;
  update(id: string, data: Partial<Client>): Promise<Client>;
}

export function createClientApi(http: HttpClient): ClientApi {
  const mapClient = (raw: any): Client => ({
    id: raw.id,
    name: raw.name,
    phone: raw.phone ?? '',
    email: raw.email ?? undefined,
    birthday: raw.birthday ?? undefined,
    isVip: raw.isVip ?? false,
    notes: raw.notes ?? undefined,
    preferences: raw.preferences ?? undefined,
    allergies: raw.allergies ?? undefined,
  });

  return {
    list: async () => {
      const arr = await http.get<any[]>(API.CUSTOMERS);
      return (arr || []).map(mapClient);
    },
    create: async (data) => {
      const raw = await http.post<any>(API.CUSTOMERS, data);
      return mapClient(raw);
    },
    getById: async (id) => {
      const raw = await http.get<any>(`${API.CUSTOMERS}/${id}`);
      return mapClient(raw);
    },
    update: async (id, data) => {
      const raw = await http.put<any>(`${API.CUSTOMERS}/${id}`, data);
      return mapClient(raw);
    },
  };
}
