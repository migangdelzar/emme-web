interface ImportMetaEnv {
  readonly PROD: boolean;
  readonly VITE_APP_ENV?: string;
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
