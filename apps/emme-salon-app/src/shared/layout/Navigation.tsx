import {
  Calendar,
  Users,
  ClipboardList,
  Settings,
  LayoutDashboard,
  Plus,
  Clock,
  Globe,
  BarChart3,
  UserPlus,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { els } from '@emme/i18n';
import { useUiStore } from '@/stores/uiStore';
import { useAppTranslation } from '@/app/translation';

interface NavProps {
  activeTab: string;
}

export function Sidebar({ activeTab }: NavProps) {
  const navigate = useNavigate();
  const { t } = useAppTranslation();
  const menuItems = [
    { id: 'dashboard', label: t('common.dashboard'), icon: LayoutDashboard },
    { id: 'agenda', label: t('common.appointments'), icon: Calendar },
    { id: 'finances', label: t('common.finances'), icon: BarChart3 },
    { id: 'clients', label: t('common.clients'), icon: Users },
    { id: 'services', label: t('common.services'), icon: ClipboardList },
    { id: 'settings', label: t('common.settings'), icon: Settings },
  ];

  return (
    <aside
      data-testid={els.sidebar.container.testId}
      className="w-[18rem] xl:w-80 h-screen border-r border-border flex flex-col sticky top-0 hidden lg:flex z-50 px-5 xl:px-10 py-8 xl:py-16 bg-background overflow-y-auto custom-scrollbar shrink-0"
    >
      <div className="mb-10 xl:mb-16 flex items-center justify-between px-2">
        <button
          type="button"
          data-testid={els.sidebar.brand.testId}
          className="flex items-center group cursor-pointer border-none bg-transparent p-0 m-0"
          onClick={() => navigate('/dashboard')}
        >
          <h1 className="text-2xl xl:text-3xl font-display font-semibold tracking-[-0.06em] flex items-center">
            <span className="text-primary group-hover:scale-105 transition-transform duration-500">
              emme
            </span>
            <span className="text-foreground/80">nails</span>
          </h1>
        </button>
        <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center select-none shadow-sm">
          <Sparkles className="size-5 stroke-[2.5]" />
        </div>
      </div>

      <nav className="flex-1 space-y-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            data-testid={els.nav[item.id as keyof typeof els.nav].testId}
            onClick={() => navigate(`/${item.id}`)}
            className={cn(
              'w-full flex items-center gap-5 px-6 py-4 rounded-[1.25rem] transition-all duration-500 group relative overflow-hidden',
              activeTab === item.id
                ? 'bg-card shadow-md shadow-black/5 dark:shadow-white/5 border border-border text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
            )}
          >
            <div
              className={cn(
                'size-10 rounded-xl flex items-center justify-center transition-all duration-500',
                activeTab === item.id
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'bg-black/5 dark:bg-white/5 group-hover:bg-black/10 dark:group-hover:bg-white/10'
              )}
            >
              <item.icon
                className={cn(
                  'size-5 transition-all duration-500',
                  activeTab === item.id ? 'stroke-[2.5]' : 'stroke-[1.8]'
                )}
              />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">{item.label}</span>

            {activeTab === item.id && (
              <motion.div
                layoutId="navTabIndicator"
                className="absolute right-4 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(0,113,227,0.4)]"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="relative p-8 rounded-[24px] overflow-hidden group cursor-pointer material-thin hover:shadow-lg transition-all duration-700">
          <div className="relative z-10 flex flex-col gap-6 items-center text-center">
            <div className="size-12 rounded-2xl bg-secondary flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform duration-500">
              <Globe className="size-6" />
            </div>
            <div className="space-y-1">
              <p className="text-[15px] font-semibold text-foreground tracking-tight">
                {t('common.socialConnect')}
              </p>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest leading-none">
                @emmenails.atelier
              </p>
            </div>
            <Button className="h-12 rounded-2xl bg-foreground text-background text-[13px] font-semibold tracking-tight w-full hover:bg-primary hover:text-primary-foreground transition-all shadow-sm active:scale-95">
              {t('common.copyProfile')}
            </Button>
          </div>
          <div className="absolute -bottom-10 -right-10 size-40 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
        </div>
      </div>
    </aside>
  );
}

export function MobileNav({ activeTab }: NavProps) {
  const navigate = useNavigate();
  const { t } = useAppTranslation();
  const isOpen = useUiStore((state) => state.sidebarOpen);
  const dispatch = useUiStore((state) => state.dispatch);
  const setIsOpen = (open: boolean) => dispatch({ type: 'setSidebarOpen', open });

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('common.dashboard') },
    { id: 'agenda', icon: Calendar, label: t('common.appointments') },
    { id: 'services', icon: ClipboardList, label: t('common.services') },
    { id: 'finances', icon: BarChart3, label: t('common.finances') },
    { id: 'clients', icon: Users, label: t('common.clients') },
    { id: 'settings', icon: Settings, label: t('common.settings') },
  ];

  return (
    <>
      <div className="fixed bottom-[116px] lg:bottom-10 right-6 lg:right-10 z-[110]">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/30 backdrop-blur-[20px] z-[-1]"
            />
          )}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'size-14 rounded-2xl flex items-center justify-center shadow-[0_12px_40px_rgba(0,0,0,0.15)] dark:shadow-white/5 transition-all duration-500 relative',
            isOpen ? 'bg-foreground text-background' : 'bg-primary text-primary-foreground'
          )}
        >
          <motion.div
            animate={{ rotate: isOpen ? 135 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <Plus className="size-8 stroke-[2.5]" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)' }}
              className="absolute bottom-20 right-0 material-regular p-3 rounded-[28px] w-64 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.3)] dark:shadow-white/5 space-y-1 overflow-hidden"
            >
              <div className="px-5 py-4 mb-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/30">
                  {t('common.directActions')}
                </p>
              </div>
              {[
                {
                  id: 'appointment',
                  label: t('common.newAppointment'),
                  icon: Calendar,
                  color: 'bg-primary',
                },
                {
                  id: 'client',
                  label: t('common.addClient'),
                  icon: UserPlus,
                  color: 'bg-foreground',
                },
                {
                  id: 'service',
                  label: t('common.registerService'),
                  icon: ClipboardList,
                  color: 'bg-foreground',
                },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setIsOpen(false);
                    if (action.id === 'appointment') navigate('/agenda?add=true');
                    else if (action.id === 'client') navigate('/clients?add=true');
                    else if (action.id === 'service') navigate('/services?add=true');
                  }}
                  className="w-full h-14 px-4 rounded-[1.25rem] hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 flex items-center gap-4 transition-all group"
                >
                  <div
                    className={cn(
                      'size-10 rounded-xl flex items-center justify-center text-primary-foreground transition-all group-active:scale-90',
                      action.color === 'bg-foreground'
                        ? 'bg-foreground text-background'
                        : action.color
                    )}
                  >
                    <action.icon className="size-4.5" />
                  </div>
                  <span className="text-[14px] font-semibold text-foreground tracking-tight">
                    {action.label}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 lg:hidden z-[100] pointer-events-none">
        <nav className="h-20 material-regular rounded-[28px] flex items-center justify-around px-2 shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-white/5 border border-border pointer-events-auto max-w-[420px] mx-auto overflow-hidden">
          {menuItems.map((item) => (
            <button
              key={item.id}
              data-testid={els.nav[item.id as keyof typeof els.nav].testId}
              onClick={() => navigate(`/${item.id}`)}
              className={cn(
                'flex-1 flex flex-col items-center justify-center h-full transition-all duration-500 relative group min-w-[48px]',
                activeTab === item.id
                  ? 'text-primary dark:text-primary'
                  : 'text-muted-foreground/50 hover:text-foreground'
              )}
            >
              <item.icon
                className={cn(
                  'size-6 transition-all duration-500',
                  activeTab === item.id ? 'stroke-[2.5] -translate-y-1' : 'stroke-[1.8]'
                )}
              />
              <span
                className={cn(
                  'text-[9px] mt-1 font-bold uppercase tracking-[0.05em] transition-all duration-500',
                  activeTab === item.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
                )}
              >
                {item.label}
              </span>

              {activeTab === item.id && (
                <motion.div
                  layoutId="mobileActiveIndicator"
                  className="absolute bottom-2 size-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(0,113,227,0.5)]"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
