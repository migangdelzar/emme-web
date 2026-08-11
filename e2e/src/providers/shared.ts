/** Shared types and utilities between MockProvider and RealProvider. */

export interface RouteOverride {
  pattern: string;
  harFile?: string;
  useStore?: boolean;
  tweakFn?: (res: { status: number; body: any; headers: Record<string, string> }) => void | { status?: number; body?: any };
  slowMs?: number;
  forceStatus?: number;
}

/** Match a route pattern against a method+path. Pattern format: 'GET /api/services/*' or 'POST /api/**'. */
export function matchPattern(pattern: string, method: string, path: string): boolean {
  const [pMethod, pPath] = pattern.split(' ');
  if (!pMethod || !pPath) return false;
  if (pMethod.toUpperCase() !== method.toUpperCase()) return false;
  const escaped = pPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp('^' + escaped.replace(/\\\*\\\*/g, '.*').replace(/\\\*/g, '[^/]+') + '$');
  return regex.test(path);
}
