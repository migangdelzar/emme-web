import type { Design } from '../../domain/index.js';

export function DesignGallery({ designs }: { readonly designs: readonly Design[] }) {
  return <ul aria-label="Design gallery">{designs.map((design) => <li key={design.id}>{design.title}</li>)}</ul>;
}
