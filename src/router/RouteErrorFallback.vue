<script setup lang="ts">
import { computed } from 'vue';
import { useLocaleStore } from '@/locales/localeStore';
import { isChunkLoadError } from '@/router/lazyWithRetry';

const props = defineProps<{
  error: Error;
}>();

const localeStore = useLocaleStore();
const isDev = import.meta.env.DEV;
const isStaleChunk = computed(() => isChunkLoadError(props.error));

function handleRetry(): void {
  window.location.reload();
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-stone-50 p-6 dark:bg-surface-950">
    <div
      class="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg dark:border-red-900/50 dark:bg-surface-800"
    >
      <h1 class="mb-2 text-xl font-semibold text-stone-900 dark:text-white">
        {{
          isStaleChunk ? localeStore.t('error.chunkTitle') : localeStore.t('error.boundaryTitle')
        }}
      </h1>
      <p class="mb-6 text-sm text-stone-600 dark:text-stone-400">
        {{
          isStaleChunk
            ? localeStore.t('error.chunkDescription')
            : localeStore.t('error.boundaryDescription')
        }}
      </p>
      <pre
        v-if="isDev"
        class="mb-6 max-h-32 overflow-auto rounded-lg bg-stone-100 p-3 text-left text-xs text-red-600 dark:bg-surface-800 dark:text-red-400"
      >
        {{ error.message }}
      </pre>
      <div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          class="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface-900"
          @click="handleRetry"
        >
          {{ localeStore.t('error.reloadPage') }}
        </button>
        <RouterLink
          to="/dashboard"
          class="rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-surface-500 dark:text-stone-300 dark:hover:bg-surface-700 dark:focus:ring-offset-surface-900"
        >
          {{ localeStore.t('error.goHome') }}
        </RouterLink>
      </div>
    </div>
  </div>
</template>
