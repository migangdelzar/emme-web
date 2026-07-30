import { useAuth } from './useAuth';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { motion } from 'motion/react';
import { Building2, ChevronRight } from 'lucide-react';

export function TenantSelector() {
  const { allTenants, selectTenant } = useAuth();

  if (allTenants.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Sin estudios disponibles</CardTitle>
            <CardDescription>
              No tienes estudios asociados a tu cuenta. Contacta a soporte.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Selecciona tu estudio</CardTitle>
          <CardDescription>
            Elige el estudio al que quieres acceder
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {allTenants.map((t) => (
            <motion.div
              key={t.tenantId}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Button
                variant="outline"
                className="w-full justify-between p-6 h-auto text-left"
                onClick={() => selectTenant(t.tenantSlug)}
              >
                <div className="flex items-center gap-4">
                  <Building2 className="size-6 text-primary opacity-70" />
                  <div>
                    <p className="font-semibold text-base">{t.tenantName || t.tenantSlug}</p>
                    <p className="text-sm text-muted-foreground capitalize">{t.role.toLowerCase()}</p>
                  </div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground" />
              </Button>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
