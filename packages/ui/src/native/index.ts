import type { NativeComponentProps } from '../theme/ui.types.js';

export type { NativeComponentProps } from '../theme/ui.types.js';
export { tokens } from '../theme/tokens.js';

export type NativePlatformComponent<Props extends object = NativeComponentProps> = {
  readonly platform: 'native';
  readonly props: Props;
};
