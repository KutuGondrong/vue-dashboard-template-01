<script setup lang="ts">
import { useLocaleStore } from '@/locales/localeStore';

const localeStore = useLocaleStore();
const year = new Date().getFullYear();
</script>

<template>
  <div
    class="flex w-full flex-col items-center justify-between gap-1 text-xs text-stone-500 sm:flex-row sm:gap-2 sm:text-sm dark:text-stone-400"
  >
    <p class="truncate">
      {{ localeStore.t('footer.copyright', { year }) }}
    </p>
    <p class="shrink-0">
      {{ localeStore.t('footer.version', { version: '1.0.0' }) }}
    </p>
  </div>
</template>
