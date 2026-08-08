import type { Client, CreateClientInput, UpdateClientInput } from "@emme/domain";

export type { CreateClientInput, UpdateClientInput } from "@emme/domain";

export interface ClientRepository {
  create(input: CreateClientInput): Promise<Client>;
  update(id: string, input: UpdateClientInput): Promise<Client>;
}
