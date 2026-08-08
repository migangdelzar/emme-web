import { useMemo, useCallback } from 'react';
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  type Customer,
} from '@/features/clients/api/clients.queries';
import type { Client } from '@emme/domain';

function mapClientView(raw: Customer): Client {
  return {
    id: raw.id,
    name: raw.name,
    phone: raw.phone || '',
    email: raw.email || '',
    notes: raw.notes || '',
    allergies: raw.allergies || '',
    preferences: raw.preferences || '',
    isVip: raw.isVip || false,
    birthday: raw.birthday || '',
  };
}

export function useClientData() {
  const { data, isLoading, error } = useCustomers();
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const clients: Client[] = useMemo(() => (data?.customers || []).map(mapClientView), [data]);

  const addClient = useCallback(
    async (client: Omit<Client, 'id'>) => {
      await createMutation.mutateAsync({
        name: client.name,
        phone: client.phone || null,
        email: client.email || null,
        notes: client.notes || null,
        allergies: client.allergies || null,
        preferences: client.preferences || null,
        isVip: client.isVip || false,
        birthday: client.birthday || null,
      });
    },
    [createMutation]
  );

  const updateClient = useCallback(
    async (client: Client) => {
      await updateMutation.mutateAsync({
        id: client.id,
        name: client.name,
        phone: client.phone || null,
        email: client.email || null,
        notes: client.notes || null,
        allergies: client.allergies || null,
        preferences: client.preferences || null,
        isVip: client.isVip || false,
        birthday: client.birthday || null,
      });
    },
    [updateMutation]
  );

  const deleteClient = useCallback(
    async (clientId: string) => {
      await deleteMutation.mutateAsync(clientId);
    },
    [deleteMutation]
  );

  return {
    loading: isLoading,
    error: error?.message || null,
    clients,
    addClient,
    updateClient,
    deleteClient,
  };
}
