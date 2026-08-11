import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@emme/core';
import type { SpreadsheetLink } from '@emme/api';
import { apiErrorMessage } from '../../shared/apiErrorMessage';
import { useAppTranslation } from '@emme/i18n';
import { toast } from 'sonner';

export function useSheetsExport() {
  const api = useApi();
  const { t } = useAppTranslation();
  const queryClient = useQueryClient();

  const sheets = useQuery<SpreadsheetLink[]>({
    queryKey: ['google-sheets'],
    queryFn: () => api.googleSheets.list(),
  });

  const exportData = useMutation({
    mutationFn: (exportType: 'APPOINTMENTS' | 'CLIENTS' | 'FULL') =>
      api.googleSheets.exportData({ exportType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-sheets'] });
      toast.success(t('common.export_complete'));
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, t, 'common.errors.sheets_export_failed')),
  });

  return { sheets, exportData: exportData.mutate, isExporting: exportData.isPending };
}
