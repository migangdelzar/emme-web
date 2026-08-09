import type { Permission } from '../access-control/permissions.js';

export interface RouteDefinition {
  readonly key: string;
  readonly path: string;
  readonly requiredPermissions?: readonly Permission[];
}

export interface NavigationDefinition {
  readonly key: string;
  readonly label: string;
  readonly path: string;
}

export interface ModuleDefinition {
  readonly key: string;
  readonly routes: readonly RouteDefinition[];
  readonly navigation?: readonly NavigationDefinition[];
}

export function defineRoute<const TRoute extends RouteDefinition>(route: TRoute): TRoute {
  return route;
}

export function defineModule<const TModule extends ModuleDefinition>(module: TModule): TModule {
  return module;
}
