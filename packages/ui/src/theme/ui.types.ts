export interface UiTokens {
  readonly colors: Readonly<Record<string, string>>;
  readonly spacing: Readonly<Record<string, string>>;
  readonly typography: Readonly<Record<string, string>>;
}

export interface WebComponentProps {
  readonly className?: string;
}

export interface NativeComponentProps {
  readonly accessibilityLabel?: string;
  readonly testID?: string;
  readonly disabled?: boolean;
}
