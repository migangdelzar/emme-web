import { describe, expect, it, vi } from 'vitest';
import { createMutationOptions, createQueryResource, createResourceKey } from './queryFactory';

describe('queryFactory', () => {
  it('creates stable resource keys and parameterized list options', async () => {
    const list = vi.fn(async ({ category }: { category?: string }) => ({
      items: category ? [`${category}-item`] : [],
    }));
    const resource = createQueryResource({
      key: 'services',
      queryKey: (params: { category?: string }) =>
        [...createResourceKey('services'), 'list', params] as const,
      queryFn: list,
    });

    const options = resource.listOptions({ category: 'manicure' });

    expect(resource.rootKey).toEqual(['services']);
    expect(options.queryKey).toEqual(['services', 'list', { category: 'manicure' }]);
    await expect(options.queryFn({} as never)).resolves.toEqual({ items: ['manicure-item'] });
    expect(list).toHaveBeenCalledWith({ category: 'manicure' });
  });

  it('invalidates the resource after a successful mutation', async () => {
    const invalidateQueries = vi.fn(async () => undefined);
    const mutation = createMutationOptions(
      {
        key: 'customers',
        mutationFn: async (input: { name: string }) => ({ id: 'customer-1', ...input }),
      },
      { invalidateQueries }
    );

    await expect(mutation.mutationFn({ name: 'Ada' })).resolves.toEqual({
      id: 'customer-1',
      name: 'Ada',
    });
    await mutation.onSuccess?.();

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['customers'] });
  });
});
