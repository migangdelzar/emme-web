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
