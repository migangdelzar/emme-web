export interface Service {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly price: number;
  readonly durationMinutes: number;
  readonly isActive: boolean;
  readonly description?: string;
}

export interface Design {
  readonly id: string;
  readonly tenantId: string;
  readonly title: string;
  readonly imageUrl?: string;
  readonly isActive: boolean;
  readonly isPublic: boolean;
}

export class InvalidCatalogValueError extends Error {
  readonly code = 'INVALID_CATALOG_VALUE';
}

export function createService(input: Service): Service {
  if (!Number.isFinite(input.price) || input.price < 0) {
    throw new InvalidCatalogValueError('Service price must be non-negative');
  }
  if (!Number.isInteger(input.durationMinutes) || input.durationMinutes <= 0) {
    throw new InvalidCatalogValueError('Service duration must be positive');
  }
  if (!input.tenantId.trim()) throw new InvalidCatalogValueError('Service tenant is required');
  return { ...input };
}

export function calculateServiceTotal(service: Service, quantity = 1): number {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new InvalidCatalogValueError('Service quantity must be positive');
  }
  return service.price * quantity;
}

export function isServiceBookable(service: Service): boolean {
  return service.isActive && service.durationMinutes > 0;
}

export function isDesignVisible(design: Design, tenantId: string): boolean {
  return design.tenantId === tenantId && design.isActive && design.isPublic;
}
