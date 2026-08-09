/// <reference types="vite/client" />

interface EmmeRuntimeConfig {
  apiUrl?: string;
  environment?: string;
  appName?: string;
  webBaseDomain?: string;
}

interface Window {
  __EMME_RUNTIME_CONFIG__?: EmmeRuntimeConfig;
}
