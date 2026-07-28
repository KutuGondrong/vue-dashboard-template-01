/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_BASE_PATH?: string;
  readonly VITE_SHOW_DEV_FEATURES?: string;
  readonly VITE_ENABLE_SCROLL_TO_TOP?: string;
  readonly VITE_OG_SITE_URL?: string;
  readonly MODE: string;
  readonly BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
