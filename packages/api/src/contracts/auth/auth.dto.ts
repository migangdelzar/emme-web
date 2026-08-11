import type { AuthUserDto } from './user.dto.js';

export interface AuthSessionDto extends AuthUserDto {
  memberships: Array<{
    tenantId: string;
    tenantSlug: string;
    tenantName: string;
    role: string;
    status: string;
    permissions: string[];
  }>;
}
