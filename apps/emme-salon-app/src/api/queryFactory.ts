import { queryOptions, type QueryClient } from '@tanstack/react-query';

export type ResourceKey<Name extends string = string> = readonly [Name];

export function createResourceKey<const Name extends string>(name: Name): ResourceKey<Name> {
  return [name] as const;
}

export interface QueryResourceDefinition<TParams, TData, TName extends string = string> {
  readonly key: TName;
  readonly queryKey: (params: TParams) => readonly unknown[];
  readonly queryFn: (params: TParams) => Promise<TData>;
}

export function createQueryResource<TParams, TData, const TName extends string>(
  definition: QueryResourceDefinition<TParams, TData, TName>
) {
  const rootKey = createResourceKey(definition.key);

  return {
    rootKey,
    listOptions: (params: TParams) =>
      queryOptions({
        queryKey: definition.queryKey(params),
        queryFn: () => definition.queryFn(params),
      }),
  };
}

export interface MutationResourceDefinition<TVariables, TData, TName extends string = string> {
  readonly key: TName;
  readonly mutationFn: (variables: TVariables) => Promise<TData>;
}

export function createMutationOptions<TVariables, TData, const TName extends string>(
  definition: MutationResourceDefinition<TVariables, TData, TName>,
  queryClient: Pick<QueryClient, 'invalidateQueries'>
) {
  const rootKey = createResourceKey(definition.key);

  return {
    mutationKey: rootKey,
    mutationFn: definition.mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: rootKey }),
  };
}
