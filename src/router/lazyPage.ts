import type { DefineComponent } from 'vue';
import { loaderWithRetry } from '@/router/lazyWithRetry';

export function lazyPage(loader: () => Promise<{ default: DefineComponent }>) {
  return () => loaderWithRetry(loader);
}
