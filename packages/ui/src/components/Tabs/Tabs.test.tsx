// @vitest-environment happy-dom

import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs.js';

function ExampleTabs({ onValueChange = vi.fn() }: { onValueChange?: (value: string) => void }) {
  return (
    <Tabs defaultValue="details" onValueChange={onValueChange}>
      <TabsList aria-label="Client settings">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
        <TabsTrigger disabled value="advanced">Advanced</TabsTrigger>
      </TabsList>
      <TabsContent value="details">Details content</TabsContent>
      <TabsContent value="billing">Billing content</TabsContent>
    </Tabs>
  );
}

describe('Tabs', () => {
  afterEach(cleanup);

  it('uses accessible tab names and activates the next enabled tab from the keyboard', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(<ExampleTabs onValueChange={onValueChange} />);

    await user.tab();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('tab', { name: 'Billing' }).getAttribute('data-state')).toBe('active');
    expect(onValueChange).toHaveBeenCalledWith('billing');
  });

  it('does not activate a disabled tab', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(<ExampleTabs onValueChange={onValueChange} />);
    const tab = screen.getByRole('tab', { name: 'Advanced' });

    await user.click(tab);

    expect(tab.getAttribute('data-disabled')).not.toBeNull();
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
