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
  <div class="flex items-center gap-4">
    <div
      class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-stone-100 bg-stone-50 shadow-sm dark:border-surface-600 dark:bg-surface-800/80"
    >
      <img
        :src="logoSrc"
        :alt="appConfig.title"
        class="h-9 w-9 object-contain"
        width="36"
        height="36"
      >
    </div>
    <div class="min-w-0 text-left">
      <h2 class="text-lg font-semibold leading-tight tracking-tight text-stone-900 dark:text-white">
        {{ appConfig.title }}
      </h2>
      <p
        v-if="description"
        class="mt-1 text-sm leading-relaxed text-stone-500 dark:text-stone-400"
      >
        {{ description }}
      </p>
    </div>
  </div>
</template>
