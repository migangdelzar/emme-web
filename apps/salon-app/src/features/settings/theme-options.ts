import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sparkles, Sun } from 'lucide-react';

export const themeOptions = [
  {
    id: 'light',
    labelKey: 'settings.themeLight',
    descriptionKey: 'settings.themeLightDescription',
    icon: Sun,
  },
  {
    id: 'dark',
    labelKey: 'settings.themeDark',
    descriptionKey: 'settings.themeDarkDescription',
    icon: Moon,
  },
  {
    id: 'system',
    labelKey: 'settings.themeSystem',
    descriptionKey: 'settings.themeSystemDescription',
    icon: Monitor,
  },
  {
    id: 'rose',
    labelKey: 'settings.themeRose',
    descriptionKey: 'settings.themeRoseDescription',
    icon: Sparkles,
  },
] as const satisfies readonly {
  id: string;
  labelKey: `settings.${string}`;
  descriptionKey: `settings.${string}`;
  icon: LucideIcon;
}[];

export type SalonTheme = (typeof themeOptions)[number]['id'];
