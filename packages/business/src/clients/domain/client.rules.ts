export function normalizeClientName(name: string): string {
  const normalized = name.trim().replace(/\s+/g, " ");

  if (!normalized) {
    throw new Error("Client name is required");
  }

  return normalized;
}
