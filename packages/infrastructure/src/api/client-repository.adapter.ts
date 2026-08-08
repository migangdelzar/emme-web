import { createClientApi, type HttpClient } from "@emme/api";
import type {
  ClientRepository,
  CreateClientInput,
  UpdateClientInput,
} from "@emme/application";

export function createClientRepository(http: HttpClient): ClientRepository {
  const clientsApi = createClientApi(http);

  return {
    create: (input: CreateClientInput) => clientsApi.create(input),
    update: (id: string, input: UpdateClientInput) => clientsApi.update(id, input),
  };
}
