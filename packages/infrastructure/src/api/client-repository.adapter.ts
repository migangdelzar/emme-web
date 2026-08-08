import { createClientApi, type HttpClient } from "@emme/api";
import type { ClientRepository, CreateClientInput } from "@emme/application";

export function createClientRepository(http: HttpClient): ClientRepository {
  const clientsApi = createClientApi(http);

  return {
    create: (input: CreateClientInput) => clientsApi.create(input),
  };
}
