import { useState } from 'react';
import { Loader2, FileSpreadsheet } from 'lucide-react';
import { Button } from '@emme/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@emme/ui';
import { Label } from '@emme/ui';
import { Card, CardContent } from '@emme/ui';
import { useSheetsExport } from '../hooks/useSheetsExport';

const EXPORT_OPTIONS = [
  { value: 'APPOINTMENTS', label: 'Appointments' },
  { value: 'CLIENTS', label: 'Clients' },
  { value: 'FULL', label: 'Full Export' },
] as const;

export function SheetsExportSection() {
  const [exportType, setExportType] = useState<'APPOINTMENTS' | 'CLIENTS' | 'FULL'>('APPOINTMENTS');
  const { exportData, isExporting } = useSheetsExport();

  return (
    <Card>
      <CardContent className="space-y-4 py-4">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="size-5 text-green-600" />
          <Label className="text-sm font-semibold">Exportar a Google Sheets</Label>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs text-muted-foreground">Tipo de exportación</Label>
            <Select
              value={exportType}
              onValueChange={(val) => setExportType(val as typeof exportType)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => exportData(exportType)}
            disabled={isExporting}
            className="rounded-xl gap-2"
          >
            {isExporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="size-4" />
            )}
            {isExporting ? 'Exportando...' : 'Export to Sheets'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
