<script setup lang="ts">
import { ref, computed, onErrorCaptured } from 'vue';
import { useLocaleStore } from '@/locales/localeStore';
import { isChunkLoadError } from '@/router/lazyWithRetry';

const localeStore = useLocaleStore();
const hasError = ref(false);
const error = ref<Error | null>(null);
const isDev = import.meta.env.DEV;

const isStaleChunk = computed(() => isChunkLoadError(error.value));

onErrorCaptured((err) => {
  hasError.value = true;
  error.value = err instanceof Error ? err : new Error(String(err));
  console.error('AppErrorBoundary caught an error:', err);
  return false;
});

function handleRetry(): void {
  hasError.value = false;
  error.value = null;
  window.location.reload();
}
</script>

<template>
  <div
    v-if="hasError"
    class="flex min-h-screen items-center justify-center bg-stone-50 p-6 dark:bg-surface-950"
  >
    <div
      class="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg dark:border-red-900/50 dark:bg-surface-800"
    >
      <div
        class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30"
      >
        <svg
          class="h-8 w-8 text-red-600 dark:text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
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
        v-if="error && isDev"
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
  <slot v-else />
</template>
