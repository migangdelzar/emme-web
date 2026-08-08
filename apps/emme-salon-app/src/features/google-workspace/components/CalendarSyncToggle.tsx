import { useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@emme/ui';
import { Switch } from '@emme/ui';
import { Label } from '@emme/ui';
import { Card, CardContent } from '@emme/ui';
import { useCalendarSync } from '@/features/google-workspace/hooks/useCalendarSync';

export function CalendarSyncToggle() {
  const [autoSync, setAutoSync] = useState(false);
  const { syncNow, isSyncing } = useCalendarSync();

  return (
    <Card>
      <CardContent className="space-y-4 py-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm font-semibold">Auto-sync to Google Calendar</Label>
            <p className="text-xs text-muted-foreground">
              Sincroniza automáticamente las citas con tu calendario de Google
            </p>
          </div>
          <Switch checked={autoSync} onCheckedChange={setAutoSync} />
        </div>
        <div className="border-t border-border pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncNow()}
            disabled={isSyncing}
            className="rounded-xl gap-2"
          >
            {isSyncing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            {isSyncing ? 'Sincronizando...' : 'Sync Now'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
