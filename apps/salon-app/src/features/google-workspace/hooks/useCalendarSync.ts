import { useMutation } from '@tanstack/react-query';
import { useApi } from '@emme/core';
import { apiErrorMessage } from '../../shared/apiErrorMessage';
import { useAppTranslation } from '@emme/i18n';
import { toast } from 'sonner';

export function useCalendarSync() {
  const api = useApi();
  const { t } = useAppTranslation();
  const sync = useMutation({
    mutationFn: () => api.calendarSync.syncNow(),
    onError: (error) =>
      toast.error(apiErrorMessage(error, t, 'common.errors.calendar_sync_failed')),
  });
  return { syncNow: sync.mutate, isSyncing: sync.isPending };
}
