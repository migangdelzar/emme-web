export interface CreateServiceRequest {
  name: string;
  category: string;
  basePrice: number;
  durationMinutes: number;
  description?: string;
}

export type UpdateServiceRequest = Partial<CreateServiceRequest> & {
  isActive?: boolean;
};
