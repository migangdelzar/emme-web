import { createService, type Design, type Service } from '../domain/index.js';
import type { CatalogRepository, DesignCatalogRepository } from './ports.js';

export function createCatalogOperations(dependencies: {
  readonly catalog: CatalogRepository;
  readonly designs: DesignCatalogRepository;
}) {
  return {
    listServices: ({ tenantId }: { readonly tenantId: string }) => dependencies.catalog.list(tenantId),
    createService: (service: Service) => dependencies.catalog.save(createService(service)),
    updateService: (service: Service) => dependencies.catalog.save(createService(service)),
    retireService: async ({ tenantId, serviceId }: { readonly tenantId: string; readonly serviceId: string }) => {
      const value = await dependencies.catalog.findById(serviceId);
      if (!value || value.tenantId !== tenantId) throw new Error('Service not found');
      await dependencies.catalog.retire(serviceId);
    },
    browseDesigns: (tenantId: string): Promise<Design[]> => dependencies.designs.listPublic(tenantId),
  };
}
