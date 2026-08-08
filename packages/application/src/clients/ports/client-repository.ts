import type { Client } from "@emme/domain";

export type CreateClientInput = Omit<Client, "id">;

export interface ClientRepository {
  create(input: CreateClientInput): Promise<Client>;
}
