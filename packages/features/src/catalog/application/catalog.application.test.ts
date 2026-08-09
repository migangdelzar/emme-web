import { describe, expect, it } from 'vitest';
import { createCatalogOperations } from './catalog.operations.js';
import type { CatalogRepository, DesignCatalogRepository } from './ports.js';
import type { Design, Service } from '../domain/index.js';

const service: Service = {
  id: 'service-1', tenantId: 'tenant-1', name: 'Manicure', price: 450, durationMinutes: 60, isActive: true,
};

class FakeCatalog implements CatalogRepository {
  values = [service];
  async list() { return this.values; }
  async save(value: Service) { this.values = [value]; return value; }
  async findById(id: string) { return this.values.find((value) => value.id === id) ?? null; }
  async retire(id: string) { const value = await this.findById(id); if (value) await this.save({ ...value, isActive: false }); }
}

class FakeDesigns implements DesignCatalogRepository {
  async listPublic() { return [{ id: 'design-1', tenantId: 'tenant-1', title: 'Art', isActive: true, isPublic: true } satisfies Design]; }
}

describe('catalog application operations', () => {
  it('lists, updates, retires, and browses through injected ports', async () => {
    const catalog = new FakeCatalog();
    const designs = new FakeDesigns();
    const operations = createCatalogOperations({ catalog, designs });
    await expect(operations.listServices({ tenantId: 'tenant-1' })).resolves.toEqual([service]);
    await expect(operations.updateService({ ...service, name: 'Updated' })).resolves.toMatchObject({ name: 'Updated' });
    await operations.retireService({ tenantId: 'tenant-1', serviceId: service.id });
    await expect(operations.listServices({ tenantId: 'tenant-1' })).resolves.toMatchObject([{ isActive: false }]);
    await expect(operations.browseDesigns('tenant-1')).resolves.toHaveLength(1);
  });
});
