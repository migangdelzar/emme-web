import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HashRouter } from 'react-router-dom';
import { I18nTestProvider } from '@emme/i18n';
import { Sidebar } from './Navigation';

describe('Sidebar Integration', () => {
  it('renders menu items correctly', () => {
    // Basic test
    render(
      <I18nTestProvider locale="en-US">
        <HashRouter>
          <Sidebar activeTab="dashboard" />
        </HashRouter>
      </I18nTestProvider>
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Agenda')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
});
