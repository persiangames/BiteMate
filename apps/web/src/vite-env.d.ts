/// <reference types="vite/client" />

declare module 'firebase/app';
declare module 'firebase/auth';

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_SOCKET_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
