import { normalizeClientName, type Client } from '../domain/index.js';

import type { ClientRepository, CreateClientInput } from "./ports/client-repository.js";

interface CreateClientDependencies {
  clients: ClientRepository;
}

export function createClient(dependencies: CreateClientDependencies) {
  return async function execute(input: CreateClientInput): Promise<Client> {
    return dependencies.clients.create({
      ...input,
      name: normalizeClientName(input.name),
    });
  };
}
