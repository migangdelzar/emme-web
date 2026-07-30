import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HashRouter } from 'react-router-dom';
import { Sidebar } from './Navigation';
import { useTranslation } from 'react-i18next';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
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
