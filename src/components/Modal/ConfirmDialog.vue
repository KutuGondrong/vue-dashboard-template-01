<script setup lang="ts">
import { computed } from 'vue';
import Modal from './Modal.vue';
import { Button } from '@/components/Button';
import { useLocale } from '@/locales/localeStore';

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'primary' | 'danger';
    isLoading?: boolean;
  }>(),
  {
    variant: 'danger',
    isLoading: false,
  },
);

const emit = defineEmits<{
  close: [];
  confirm: [];
}>();

const { t } = useLocale();

const confirmIconStyles = {
  primary: {
    wrapper: 'bg-primary-100 dark:bg-primary-900/30',
    icon: 'text-primary-600 dark:text-primary-400',
  },
  danger: {
    wrapper: 'bg-red-100 dark:bg-red-900/30',
    icon: 'text-red-600 dark:text-red-400',
  },
};

const styles = computed(() => confirmIconStyles[props.variant]);
</script>

<template>
  <Modal
    :is-open="isOpen"
    :title="title"
    size="sm"
    @close="emit('close')"
  >
    <div class="text-center">
      <div
        :class="`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${styles.wrapper}`"
      >
        <svg
          v-if="variant === 'danger'"
          :class="`h-6 w-6 ${styles.icon}`"
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
        <svg
          v-else
          :class="`h-6 w-6 ${styles.icon}`"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p class="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
        {{ message }}
      </p>
    </div>

    <template #footer>
      <Button
        variant="outline"
        :disabled="isLoading"
        @click="emit('close')"
      >
        {{ cancelLabel ?? t('components.common.cancel') }}
      </Button>
      <Button
        :variant="variant"
        :is-loading="isLoading"
        @click="emit('confirm')"
      >
        {{ confirmLabel ?? t('components.common.delete') }}
      </Button>
    </template>
  </Modal>
</template>
