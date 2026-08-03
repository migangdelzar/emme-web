import { API } from "./routes.js";
import {
  asRecord,
  asRecordArray,
  booleanField,
  firstStringField,
  optionalStringField,
  stringField,
  type HttpClient,
} from "./transport.js";

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
  CUSTOMERS: "/api/customers",
} as const;

export interface ClientApi {
  list(): Promise<Client[]>;
  create(data: CreateClient): Promise<Client>;
  getById(id: string): Promise<Client>;
  update(id: string, data: Partial<Client>): Promise<Client>;
}

export function createClientApi(http: HttpClient): ClientApi {
  const mapClient = (payload: unknown): Client => {
    const raw = asRecord(payload, "customer");
    return {
      id: stringField(raw, "id", "customer"),
      name: stringField(raw, "name", "customer"),
      phone: firstStringField(raw, ["phone"]),
      email: optionalStringField(raw, "email"),
      birthday: optionalStringField(raw, "birthday"),
      isVip: booleanField(raw, "isVip"),
      notes: optionalStringField(raw, "notes"),
      preferences: optionalStringField(raw, "preferences"),
      allergies: optionalStringField(raw, "allergies"),
    };
  };

  return {
    list: async () => {
      const arr = await http.get<unknown>(API.CUSTOMERS);
      return asRecordArray(arr, "customer").map((item) => mapClient(item));
    },
    create: async (data) => {
      const raw = await http.post<unknown>(API.CUSTOMERS, data);
      return mapClient(raw);
    },
    getById: async (id) => {
      const raw = await http.get<unknown>(`${API.CUSTOMERS}/${id}`);
      return mapClient(raw);
    },
    update: async (id, data) => {
      const raw = await http.put<unknown>(`${API.CUSTOMERS}/${id}`, data);
      return mapClient(raw);
    },
  };
}
