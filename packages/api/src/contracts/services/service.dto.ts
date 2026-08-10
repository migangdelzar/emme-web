export interface ServiceDto {
  id: string;
  name: string;
  basePrice: number;
  durationMinutes: number;
  category: string;
  status?: 'ACTIVE' | 'INACTIVE';
  isActive?: boolean;
  description?: string;
}
