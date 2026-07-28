import { createFeatureLocaleStore } from '@/locales/localeUtils';
import en from '@/features/storybook/locales/en.json';
import id from '@/features/storybook/locales/id.json';

const messages = { en, id };

/** Storybook-only i18n — separate from app locales in src/locales/ */
export const useStorybookLocaleStore = createFeatureLocaleStore('storybookLocale', messages, {
  en: '@/features/storybook/locales/en.json',
  id: '@/features/storybook/locales/id.json',
});

/** Composable alias for components */
export function useStorybookLocale() {
  const store = useStorybookLocaleStore();
  return {
    locale: store.locale,
    t: store.t,
  };
}
