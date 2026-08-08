import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

import { Sidebar, MobileNav } from '@/widgets/Navigation';
import { els } from '@emme/i18n';
import { useAppTranslation } from '../translation';

export function AppLayout({ activeTab, children }: { activeTab: string; children: ReactNode }) {
  const { t } = useAppTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground flex relative overflow-hidden font-sans selection:bg-primary/5">
      <Sidebar activeTab={activeTab} />

      <main
        data-testid={els.layout.main}
        className="flex-1 pb-32 lg:pb-0 h-screen overflow-y-auto custom-scrollbar relative"
      >
        <div className="max-w-[1800px] mx-auto px-4 sm:px-10 lg:px-16 py-8 lg:py-12">
          <div className="lg:hidden flex items-center justify-between mb-10 sticky top-0 z-[60] bg-background/5 backdrop-blur-xl -mx-6 px-8 py-5 border-b border-black/[0.02]">
            <div className="flex flex-col">
              <h1 className="text-xl font-display font-bold tracking-[-0.03em] flex items-center">
                <span className="text-primary mr-1">emme</span>
                <span className="text-foreground/60">nails</span>
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-foreground/20">
                {t('common.studioManager')}
              </p>
            </div>
            <div className="size-10 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-black/[0.04] select-none scale-90">
              <Sparkles className="size-5 text-primary" />
            </div>
          </div>

          {children}
        </div>
      </main>

      <MobileNav activeTab={activeTab} />
    </div>
  );
}
