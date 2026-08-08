import { Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@emme/ui';
import { Card, CardContent } from '@emme/ui';
import { useGoogleOAuth } from '@/features/google-workspace/hooks/useGoogleOAuth';

export function GoogleAccountStatus() {
  const { status, disconnect } = useGoogleOAuth();

  if (status.isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Verificando estado de conexión...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-green-500" />
            <span className="font-semibold text-foreground">Google Workspace</span>
            <span className="size-1.5 rounded-full bg-green-500" />
            <span className="text-sm text-muted-foreground">Conectado</span>
          </div>
          {status.data?.email && (
            <span className="text-sm text-muted-foreground ml-2">
              como <span className="font-medium text-foreground">{status.data.email}</span>
            </span>
          )}
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => disconnect.mutate()}
          disabled={disconnect.isPending}
          className="rounded-xl"
        >
          {disconnect.isPending ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
          Desconectar
        </Button>
      </CardContent>
    </Card>
  );
}
