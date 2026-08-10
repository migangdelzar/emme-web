// @vitest-environment happy-dom

import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './Tooltip.js';

describe('Tooltip', () => {
  afterEach(cleanup);

  it('keeps the trigger accessible and reveals its description on keyboard focus', async () => {
    const user = userEvent.setup();

    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button aria-label="More information">i</button>
          </TooltipTrigger>
          <TooltipContent>Explains the setting</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    await user.tab();

    expect(screen.getByRole('button', { name: 'More information' })).toBe(document.activeElement);
    expect((await screen.findByRole('tooltip')).textContent).toContain('Explains the setting');
  });

  it('does not reveal a tooltip from a disabled trigger', async () => {
    const user = userEvent.setup();

    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button aria-label="More information" disabled>i</button>
          </TooltipTrigger>
          <TooltipContent>Explains the setting</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    const trigger = screen.getByRole('button', { name: 'More information' });

    await user.tab();
    await user.keyboard('{Enter}');

    expect(trigger).toHaveProperty('disabled', true);
    expect(document.activeElement).not.toBe(trigger);
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});
