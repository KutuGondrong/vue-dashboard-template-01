<script setup lang="ts">
import LocaleToggle from '@/layouts/header/components/LocaleToggle.vue';
import ThemeToggleButton from '@/layouts/header/components/ThemeToggleButton.vue';
import { useLocaleStore } from '@/locales/localeStore';
import { useThemeStore } from '@/features/settings/stores/themeStore';

const localeStore = useLocaleStore();
const themeStore = useThemeStore();
</script>

<template>
  <div class="fixed right-4 top-4 z-50 flex items-center gap-2 sm:right-6 sm:top-6">
    <LocaleToggle
      :locale="localeStore.locale"
      @change="localeStore.setLocale"
    />
    <ThemeToggleButton
      :is-dark="themeStore.resolvedTheme === 'dark'"
      :label="
        themeStore.resolvedTheme === 'dark'
          ? localeStore.t('components.common.lightMode')
          : localeStore.t('components.common.darkMode')
      "
      @toggle="themeStore.toggleTheme"
    />
  </div>
</template>
