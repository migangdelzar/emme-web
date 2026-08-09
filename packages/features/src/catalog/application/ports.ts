import type { Design, Service } from '../domain/index.js';

export interface CatalogRepository {
  list(tenantId: string): Promise<Service[]>;
  findById(id: string): Promise<Service | null>;
  save(service: Service): Promise<Service>;
  retire(id: string): Promise<void>;
}

export interface DesignCatalogRepository {
  listPublic(tenantId: string): Promise<Design[]>;
}
