import { computed } from 'vue';
import { acceptHMRUpdate, defineStore } from 'pinia';
import type { SupportedLocale } from '@/config/app.config';
import { useLocaleStore } from '@/locales/localeStore';
import { createHotMessageBag, registerJsonLocaleHmr } from '@/locales/localeHmr';

export type LocaleParams = Record<string, string | number>;

export function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === 'string' ? current : undefined;
}

export function interpolate(template: string, params?: LocaleParams): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
    params[key] !== undefined ? String(params[key]) : `{{${key}}}`,
  );
}

export function translateMessage(
  messages: Record<string, unknown>,
  key: string,
  params?: LocaleParams,
): string {
  const value = getNestedValue(messages, key);
  if (!value) return key;
  return interpolate(value, params);
}

export function trackLocaleRevision(revision: number): void {
  void revision;
}

export function createFeatureLocaleStore<
  T extends Record<SupportedLocale, Record<string, unknown>>,
>(id: string, initialMessages: T, jsonPaths: Partial<Record<SupportedLocale, string>> = {}) {
  const bag = createHotMessageBag({ ...initialMessages });
  const paths = Object.values(jsonPaths);

  registerJsonLocaleHmr(paths, async () => {
    const entries = await Promise.all(
      (Object.entries(jsonPaths) as [SupportedLocale, string][]).map(async ([loc, jsonPath]) => {
        const mod = await import(/* @vite-ignore */ jsonPath);
        return [loc, mod.default] as const;
      }),
    );
    bag.replace({ ...bag.current, ...Object.fromEntries(entries) } as T);
  });

  const useStore = defineStore(id, () => {
    const localeStore = useLocaleStore();

    function t(key: string, params?: LocaleParams): string {
      trackLocaleRevision(bag.revision.value);
      return translateMessage(
        bag.current[localeStore.locale] as Record<string, unknown>,
        key,
        params,
      );
    }

    return {
      locale: computed(() => localeStore.locale),
      t,
    };
  });

  if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useStore, import.meta.hot));
  }

  return useStore;
}
