import { acceptHMRUpdate, defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { appConfig, type SupportedLocale } from '@/config/app.config';
import { appMessageBag } from '@/locales/messages';
import { localSource } from '@/datasource/local/localSource';
import { trackLocaleRevision, translateMessage, type LocaleParams } from '@/locales/localeUtils';

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref<SupportedLocale>(localSource.getLocale() ?? appConfig.defaultLocale);

  function setLocale(newLocale: SupportedLocale): void {
    locale.value = newLocale;
    localSource.setLocale(newLocale);
  }

  function t(key: string, params?: LocaleParams): string {
    trackLocaleRevision(appMessageBag.revision.value);
    return translateMessage(
      appMessageBag.current[locale.value] as Record<string, unknown>,
      key,
      params,
    );
  }

  const localeState = computed(() => ({
    locale: locale.value,
    setLocale,
    t,
  }));

  return {
    locale,
    setLocale,
    t,
    localeState,
  };
});

export function useLocale() {
  const store = useLocaleStore();
  return {
    locale: computed(() => store.locale),
    setLocale: store.setLocale,
    t: store.t,
  };
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useLocaleStore, import.meta.hot));
}
