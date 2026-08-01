import { useMutation } from "@tanstack/react-query";
import { createCalendarSyncApi } from "@emme/contracts";
import { api } from "@/api/restClient";
import { apiErrorMessage } from "@/api/apiErrorMessage";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const calendarSyncApi = createCalendarSyncApi(api);

export function useCalendarSync() {
  const { t } = useTranslation();
  const sync = useMutation({
    mutationFn: () => calendarSyncApi.syncNow(),
    onError: (error) =>
      toast.error(apiErrorMessage(error, t, "common.errors.calendar_sync_failed")),
  });
  return { syncNow: sync.mutate, isSyncing: sync.isPending };
}
