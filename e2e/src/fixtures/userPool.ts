export interface TestUser {
  userId: string;
  tenantId: string;
  memberships: { tenantId: string; tenantName: string; tenantSlug: string; role: string }[];
  name: string;
  email: string;
}

const POOL_SIZE = 10;

function createUser(index: number): TestUser {
  const name = `Studio ${index}`;
  return {
    userId: `e2e-user-${index}`,
    tenantId: `e2e-tenant-${index}`,
    memberships: [{ tenantId: `e2e-tenant-${index}`, tenantName: name, tenantSlug: name.toLowerCase().replace(/\s+/g, '-'), role: 'OWNER' }],
    name: `E2E User ${index}`,
    email: `e2e-${index}@emme.app`,
  };
}

const users: TestUser[] = Array.from({ length: POOL_SIZE }, (_, i) => createUser(i));
const available: TestUser[] = [...users];
const inUse = new Set<string>();

export function acquireUser(): TestUser {
  if (available.length === 0) {
    throw new Error('UserPool exhausted: no available test users. Increase POOL_SIZE.');
  }
  const user = available.shift()!;
  inUse.add(user.userId);
  console.log(`[UserPool] Acquired: ${user.userId} (${inUse.size}/${POOL_SIZE} in use)`);
  return user;
}

export function releaseUser(userId: string): void {
  const user = users.find((u) => u.userId === userId);
  if (!user) {
    console.warn(`[UserPool] Attempted to release unknown user: ${userId}`);
    return;
  }
  if (!inUse.has(userId)) {
    console.warn(`[UserPool] User ${userId} was not in use`);
    return;
  }
  inUse.delete(userId);
  available.push(user);
  console.log(`[UserPool] Released: ${userId} (${inUse.size}/${POOL_SIZE} in use)`);
}

export function poolStatus(): { available: number; inUse: number; total: number } {
  return { available: available.length, inUse: inUse.size, total: POOL_SIZE };
}
