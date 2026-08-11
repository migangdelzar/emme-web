export interface Service {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly durationMinutes: number;
  readonly isActive: boolean;
}
