import { API } from '../common/routes.js';
import type { BusinessProfile } from '../auth/auth.types.js';
import type { HttpClient } from '../ports/http-client.js';

export interface BusinessHours {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  isActive: boolean;
}

export interface BusinessPolicy {
  cancellationNoticeMinutes?: number;
  maxAdvanceBookingDays?: number;
}

export interface BusinessConfigApi {
  profile(): Promise<BusinessProfile>;
  hours(): Promise<BusinessHours[]>;
  policy(): Promise<BusinessPolicy>;
}

export function createBusinessConfigApi(http: HttpClient): BusinessConfigApi {
  return {
    profile: () => http.get<BusinessProfile>(`${API.BUSINESS_CONFIG}/profile`),
    hours: () => http.get<BusinessHours[]>(`${API.BUSINESS_CONFIG}/hours`),
    policy: () => http.get<BusinessPolicy>(`${API.BUSINESS_CONFIG}/policy`),
  };
}
