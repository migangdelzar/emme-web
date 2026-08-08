import { describe, expect, it } from 'vitest';
import { updateClient } from './update-client.js';
import type { ClientRepository } from './ports/client-repository.js';
import type { Client } from '@emme/domain';

describe('updateClient', () => {
  it('normalizes a provided name before updating the client', async () => {
    const repository = new FakeClientRepository();
    const result = await updateClient({ clients: repository })({
      id: 'client-1',
      input: { name: '  Ana   López ' },
    });

    expect(repository.updated).toEqual({ id: 'client-1', input: { name: 'Ana López' } });
    expect(result.name).toBe('Ana López');
  });
});

class FakeClientRepository implements ClientRepository {
  updated: { id: string; input: Parameters<ClientRepository['update']>[1] } | null = null;

  async create(input: Parameters<ClientRepository['create']>[0]): Promise<Client> {
    return { id: 'client-1', ...input };
  }

  async update(id: string, input: Parameters<ClientRepository['update']>[1]): Promise<Client> {
    this.updated = { id, input };
    return { id, name: input.name ?? 'Existing client', phone: input.phone ?? '555-0100' };
  }
}
