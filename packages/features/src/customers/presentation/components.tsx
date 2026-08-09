import type { Customer } from '../domain/index.js';
export function CustomerSummaryCard({ customer }: { readonly customer: Customer }) { return <article><h2>{customer.name}</h2><p>{customer.phone}</p></article>; }
export function CustomerProfile({ customer }: { readonly customer: Customer }) { return <section aria-label="Customer profile"><h2>{customer.name}</h2><p>{customer.email ?? 'No email provided'}</p></section>; }
