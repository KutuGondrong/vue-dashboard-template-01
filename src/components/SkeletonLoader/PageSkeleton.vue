<script setup lang="ts">
import { useLocale } from '@/locales/localeStore';

const { t } = useLocale();
</script>

<template>
  <div class="flex min-h-[60vh] items-center justify-center">
    <div class="text-center">
      <div
        class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 dark:border-primary-800 dark:border-t-primary-400"
      />
      <p class="text-sm text-stone-500 dark:text-stone-400">
        {{ t('components.common.loading') }}
      </p>
    </div>
  </div>
</template>
