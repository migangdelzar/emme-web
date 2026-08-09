import type { Client, CreateClientInput, UpdateClientInput } from '../../domain/index.js';

export type { CreateClientInput, UpdateClientInput } from '../../domain/index.js';

export interface ClientRepository {
  create(input: CreateClientInput): Promise<Client>;
  update(id: string, input: UpdateClientInput): Promise<Client>;
}
