export type Permission = `${string}:${string}`;

export function hasPermission(granted: readonly string[], required: Permission): boolean {
  return granted.includes(required);
}
