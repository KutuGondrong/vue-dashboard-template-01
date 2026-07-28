import { createFeatureLocaleStore } from '@/locales/localeUtils';
import en from '@/features/tutorial/locales/en.json';
import id from '@/features/tutorial/locales/id.json';

const messages = { en, id };

/** Tutorial-only i18n — separate from app locales in src/locales/ */
export const useTutorialLocaleStore = createFeatureLocaleStore('tutorialLocale', messages, {
  en: '@/features/tutorial/locales/en.json',
  id: '@/features/tutorial/locales/id.json',
});

/** Composable alias for components */
export function useTutorialLocale() {
  const store = useTutorialLocaleStore();
  return {
    locale: store.locale,
    t: store.t,
  };
}
