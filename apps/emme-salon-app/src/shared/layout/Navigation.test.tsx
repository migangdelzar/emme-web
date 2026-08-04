import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HashRouter } from 'react-router-dom';
import { Sidebar } from './Navigation';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        'common.dashboard': 'dashboard',
        'common.appointments': 'appointments',
        'common.finances': 'finances',
        'common.clients': 'clients',
        'common.services': 'services',
        'common.settings': 'settings',
        'common.socialConnect': 'Social Connect',
        'common.copyProfile': 'Copy profile',
        'common.directActions': 'Quick actions',
        'common.newAppointment': 'New appointment',
        'common.addClient': 'Add client',
        'common.registerService': 'Register service',
      })[key] ?? key,
    i18n: { resolvedLanguage: 'en-US' },
  }),
}));

describe('Sidebar Integration', () => {
  it('renders menu items correctly', () => {
    // Basic test
    render(
      <HashRouter>
        <Sidebar activeTab="dashboard" />
      </HashRouter>
    );
    expect(screen.getByText('dashboard')).toBeInTheDocument();
    expect(screen.getByText('appointments')).toBeInTheDocument();
    expect(screen.getByText('settings')).toBeInTheDocument();
  });
});
