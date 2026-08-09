import { createClientApi, type ClientApi, type HttpClient } from "@emme/api";
import type {
  ClientRepository,
  CreateClientInput,
  UpdateClientInput,
} from '@emme/business/clients';

export function createClientRepository(source: HttpClient): ClientRepository;
export function createClientRepository(source: ClientApi): ClientRepository;
export function createClientRepository(source: HttpClient | ClientApi): ClientRepository {
  const clientsApi = isClientApi(source) ? source : createClientApi(source);

  return {
    create: (input: CreateClientInput) => clientsApi.create(input),
    update: (id: string, input: UpdateClientInput) => clientsApi.update(id, input),
  };
}

function isClientApi(source: HttpClient | ClientApi): source is ClientApi {
  return 'list' in source && 'retire' in source;
}
