<script setup lang="ts">
import { useLocale } from '@/locales/localeStore';
import type { ToastMessage } from '@/models/model.type';

defineProps<{
  toast: ToastMessage;
}>();

const emit = defineEmits<{
  dismiss: [id: string];
}>();

const { t } = useLocale();

const typeStyles: Record<ToastMessage['type'], { bg: string; icon: string }> = {
  success: {
    bg: 'border-success-500/30 bg-success-500/10 dark:border-success-500/40 dark:bg-success-500/15',
    icon: 'text-success-600 dark:text-success-400',
  },
  error: {
    bg: 'border-danger-500/30 bg-danger-500/10 dark:border-danger-500/40 dark:bg-danger-500/15',
    icon: 'text-danger-600 dark:text-danger-400',
  },
  warning: {
    bg: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/30',
    icon: 'text-yellow-600 dark:text-yellow-400',
  },
  info: {
    bg: 'border-info-500/30 bg-info-500/10 dark:border-info-500/40 dark:bg-info-500/15',
    icon: 'text-info-600 dark:text-info-400',
  },
  processing: {
    bg: 'border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-900/30',
    icon: 'text-primary-600 dark:text-primary-400',
  },
};
</script>

<template>
  <div
    role="alert"
    :class="`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg transition-all ${typeStyles[toast.type].bg}`"
  >
    <div :class="`mt-0.5 shrink-0 ${typeStyles[toast.type].icon}`">
      <svg
        v-if="toast.type === 'success'"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 13l4 4L19 7"
        />
      </svg>
      <svg
        v-else-if="toast.type === 'error'"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
      <svg
        v-else-if="toast.type === 'warning'"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01"
        />
      </svg>
      <svg
        v-else-if="toast.type === 'info'"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <svg
        v-else
        class="h-5 w-5 animate-spin"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
    <div class="min-w-0 flex-1">
      <p class="text-sm font-medium text-stone-900 dark:text-white">
        {{ toast.title }}
      </p>
      <p
        v-if="toast.description"
        class="mt-0.5 text-sm text-stone-600 dark:text-stone-400"
      >
        {{ toast.description }}
      </p>
    </div>
    <button
      type="button"
      class="shrink-0 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
      :aria-label="t('components.common.dismiss')"
      @click="emit('dismiss', toast.id)"
    >
      <svg
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>
</template>
