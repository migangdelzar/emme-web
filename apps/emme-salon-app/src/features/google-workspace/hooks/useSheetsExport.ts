import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createGoogleSheetsApi, type SpreadsheetLink } from '@emme/contracts';
import { api } from '@/api/restClient';
import { apiErrorMessage } from '@/api/apiErrorMessage';
import { useAppTranslation } from '@/app/translation';
import { toast } from 'sonner';

const sheetsApi = createGoogleSheetsApi(api);

export function useSheetsExport() {
  const { t } = useAppTranslation();
  const queryClient = useQueryClient();

  const sheets = useQuery<SpreadsheetLink[]>({
    queryKey: ['google-sheets'],
    queryFn: () => sheetsApi.list(),
  });

  const exportData = useMutation({
    mutationFn: (exportType: 'APPOINTMENTS' | 'CLIENTS' | 'FULL') =>
      sheetsApi.exportData({ exportType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-sheets'] });
      toast.success(t('common.export_complete'));
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, t, 'common.errors.sheets_export_failed')),
  });

  return { sheets, exportData: exportData.mutate, isExporting: exportData.isPending };
}
