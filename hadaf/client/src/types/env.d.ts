/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  // Add more as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}