<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useLocale } from '@/locales/localeStore';

type DrawerPlacement = 'left' | 'right';
type DrawerSize = 'sm' | 'md' | 'lg' | 'xl';

interface DrawerProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  placement?: DrawerPlacement;
  size?: DrawerSize;
  closeOnBackdropClick?: boolean;
  hideCloseButton?: boolean;
  contentClassName?: string;
  id?: string;
}

const props = withDefaults(defineProps<DrawerProps>(), {
  placement: 'right',
  size: 'md',
  closeOnBackdropClick: true,
  hideCloseButton: false,
  contentClassName: '',
});

const emit = defineEmits<{ close: [] }>();

const { t } = useLocale();
const panelRef = ref<HTMLDivElement | null>(null);
const previousFocus = ref<HTMLElement | null>(null);

const sizeClasses: Record<DrawerSize, string> = {
  sm: 'w-72 max-w-[85vw]',
  md: 'w-96 max-w-[90vw]',
  lg: 'w-[28rem] max-w-[92vw]',
  xl: 'w-[32rem] max-w-[95vw]',
};

const placementPanelClasses: Record<DrawerPlacement, string> = {
  left: 'left-0 animate-drawer-enter-left',
  right: 'right-0 animate-drawer-enter-right',
};

const showHeader = computed(
  () => Boolean(props.title || props.description) || !props.hideCloseButton,
);

const panelClass = computed(
  () =>
    `fixed inset-y-0 flex flex-col border-stone-200 bg-white shadow-2xl dark:border-surface-600 dark:bg-surface-800 ${sizeClasses[props.size]} ${placementPanelClasses[props.placement]} ${props.placement === 'left' ? 'border-r' : 'border-l'}`,
);

function onClose() {
  emit('close');
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    onClose();
    return;
  }

  if (event.key === 'Tab' && panelRef.value) {
    const focusable = panelRef.value.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
}

watch(
  () => props.isOpen,
  async (open) => {
    if (open) {
      previousFocus.value = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      await nextTick();
      panelRef.value?.focus();
    } else {
      document.body.style.overflow = '';
      previousFocus.value?.focus();
    }
  },
);

onMounted(() => document.addEventListener('keydown', handleKeyDown));
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
  document.body.style.overflow = '';
});
</script>

<template>
  <Teleport
    v-if="isOpen"
    to="body"
  >
    <div class="fixed inset-0 z-50">
      <div
        class="fixed inset-0 animate-drawer-backdrop bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
        @click="closeOnBackdropClick ? onClose() : undefined"
      />
      <div
        :id="id"
        ref="panelRef"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? 'drawer-title' : undefined"
        :aria-describedby="description ? 'drawer-description' : undefined"
        tabindex="-1"
        :class="panelClass"
      >
        <div
          v-if="showHeader"
          class="flex shrink-0 items-start justify-between gap-4 border-b border-stone-200 px-6 py-4 dark:border-surface-600"
        >
          <div class="min-w-0 flex-1">
            <h2
              v-if="title"
              id="drawer-title"
              class="text-lg font-semibold text-stone-900 dark:text-white"
            >
              {{ title }}
            </h2>
            <p
              v-if="description"
              id="drawer-description"
              :class="`text-sm text-stone-500 dark:text-stone-400 ${title ? 'mt-1' : ''}`"
            >
              {{ description }}
            </p>
          </div>
          <button
            v-if="!hideCloseButton"
            type="button"
            class="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:hover:bg-surface-700 dark:hover:text-stone-300 dark:focus:ring-offset-surface-900"
            :aria-label="t('components.common.close')"
            @click="onClose"
          >
            <svg
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
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

        <div :class="`flex-1 overflow-y-auto px-6 py-5 ${contentClassName}`.trim()">
          <slot />
        </div>

        <div
          v-if="$slots.footer"
          class="flex shrink-0 justify-end gap-3 border-t border-stone-200 bg-stone-50 px-6 py-4 dark:border-surface-600 dark:bg-surface-800/50"
        >
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
