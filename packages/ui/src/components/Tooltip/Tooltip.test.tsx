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
});
