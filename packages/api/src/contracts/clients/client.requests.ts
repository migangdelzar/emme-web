import type { ClientDto } from './client.dto.js';

export type CreateClientRequest = Omit<ClientDto, 'id'>;
export type UpdateClientRequest = Partial<Omit<ClientDto, 'id'>>;
