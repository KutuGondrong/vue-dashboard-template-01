<script setup lang="ts">
import { computed } from 'vue';
import { appConfig, getAppDescription } from '@/config/app.config';
import { useLocaleStore } from '@/locales/localeStore';
import { useThemeStore } from '@/features/settings/stores/themeStore';

const localeStore = useLocaleStore();
const themeStore = useThemeStore();

const logoSrc = computed(() =>
  themeStore.resolvedTheme === 'dark' ? appConfig.logo.dark : appConfig.logo.light,
);
const description = computed(() => getAppDescription(localeStore.locale));
</script>

<template>
  <RouterLink
    to="/dashboard"
    class="flex min-w-0 flex-1 items-center gap-2 rounded-lg outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 lg:flex-none lg:gap-2.5 dark:focus-visible:ring-offset-surface-900"
  >
    <img
      :src="logoSrc"
      :alt="appConfig.title"
      class="h-7 w-7 shrink-0 rounded-lg object-contain lg:h-7 lg:w-7"
      width="28"
      height="28"
    >
    <div class="min-w-0 leading-tight">
      <span
        class="block truncate text-sm font-semibold text-stone-900 lg:text-base dark:text-white"
      >
        {{ appConfig.title }}
      </span>
      <span
        v-if="description"
        class="hidden truncate text-xs text-stone-500 lg:block dark:text-stone-400"
      >
        {{ description }}
      </span>
    </div>
  </RouterLink>
</template>
