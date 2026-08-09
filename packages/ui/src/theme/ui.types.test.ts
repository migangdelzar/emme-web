import { expectTypeOf, it } from 'vitest';

import type { NativeComponentProps, UiTokens, WebComponentProps } from './ui.types.js';

it('defines platform-neutral component contracts', () => {
  expectTypeOf<NativeComponentProps>().toMatchTypeOf<{ accessibilityLabel?: string }>();
  expectTypeOf<WebComponentProps>().toMatchTypeOf<{ className?: string }>();
  expectTypeOf<UiTokens>().toHaveProperty('spacing');
});
