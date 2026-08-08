export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  birthday?: string;
  isVip?: boolean;
  notes?: string;
  preferences?: string;
  allergies?: string;
}

export type CreateClientInput = Omit<Client, 'id'>;
export type UpdateClientInput = Partial<Omit<Client, 'id'>>;
