import type { SupportedLocale } from '@/config/app.config';
import { createHotMessageBag, registerJsonLocaleHmr } from '@/locales/localeHmr';

const localeJsonModules = import.meta.glob<{ default: Record<string, unknown> }>(
  ['./en.json', './id.json', '@/components/locales/en.json', '@/components/locales/id.json'],
  { eager: true },
);

function getLocaleModuleDefault(pathSuffix: string): Record<string, unknown> {
  const entry = Object.entries(localeJsonModules).find(([path]) =>
    path.replace(/\\/g, '/').endsWith(pathSuffix),
  );
  return entry?.[1]?.default ?? {};
}

function buildAppMessages(): Record<SupportedLocale, Record<string, unknown>> {
  const en = getLocaleModuleDefault('src/locales/en.json');
  const id = getLocaleModuleDefault('src/locales/id.json');
  const componentsEn = getLocaleModuleDefault('components/locales/en.json');
  const componentsId = getLocaleModuleDefault('components/locales/id.json');

  return {
    en: { ...en, components: componentsEn },
    id: { ...id, components: componentsId },
  };
}

const initialMessages = buildAppMessages();

export const appMessageBag = createHotMessageBag(initialMessages);

export type AppLocaleMessages = (typeof initialMessages)['en'];

registerJsonLocaleHmr(Object.keys(localeJsonModules), () => {
  appMessageBag.replace(buildAppMessages());
});
