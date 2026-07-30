import { useMutation } from "@tanstack/react-query";
import { createCalendarSyncApi } from "@emme/contracts";
import { api } from "@/api/restClient";

const calendarSyncApi = createCalendarSyncApi(api);

export function useCalendarSync() {
  const sync = useMutation({
    mutationFn: () => calendarSyncApi.syncNow(),
  });
  return { syncNow: sync.mutate, isSyncing: sync.isPending };
}
