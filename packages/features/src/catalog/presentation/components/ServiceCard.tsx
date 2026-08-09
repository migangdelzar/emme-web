import { Card, CardContent, CardHeader, CardTitle } from '@emme/ui';
import type { Service } from '../../domain/index.js';

export function ServiceCard({ service }: { readonly service: Service }) {
  return <Card><CardHeader><CardTitle>{service.name}</CardTitle></CardHeader><CardContent>{service.price} · {service.durationMinutes} min</CardContent></Card>;
}
