import type { Brand } from './brand.js';

export type EntityId<TEntity extends string = 'Entity'> = Brand<string, TEntity>;

export const createEntityId = <TEntity extends string>(value: string): EntityId<TEntity> | null => {
  if (value.trim().length === 0) {
    return null;
  }

  return value as EntityId<TEntity>;
};
