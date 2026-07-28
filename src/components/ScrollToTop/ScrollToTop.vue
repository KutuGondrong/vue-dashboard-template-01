<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useLocale } from '@/locales/localeStore';
import { getScrollTargets, scrollContainerToTop } from '@/utils/scrollContainer';

const props = defineProps<{ scrollContainer: HTMLElement }>();

const { t } = useLocale();
const route = useRoute();
const visible = ref(false);

const SCROLL_THRESHOLD = 400;

let cleanup: (() => void) | undefined;

function setupListeners() {
  cleanup?.();

  const targets = getScrollTargets(props.scrollContainer);

  const updateVisible = () => {
    visible.value = targets.some((target) => target.scrollTop > SCROLL_THRESHOLD);
  };

  updateVisible();

  for (const target of targets) {
    target.addEventListener('scroll', updateVisible, { passive: true });
  }

  const resizeObserver = new ResizeObserver(updateVisible);
  resizeObserver.observe(props.scrollContainer);
  for (const child of props.scrollContainer.children) {
    resizeObserver.observe(child);
  }

  cleanup = () => {
    for (const target of targets) {
      target.removeEventListener('scroll', updateVisible);
    }
    resizeObserver.disconnect();
  };
}

onMounted(setupListeners);
watch(() => props.scrollContainer, setupListeners);
watch(() => route.path, setupListeners);
onUnmounted(() => cleanup?.());
</script>

<template>
  <Teleport
    v-if="visible"
    to="body"
  >
    <button
      type="button"
      :aria-label="t('components.common.scrollToTop')"
      class="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 shadow-lg transition-colors hover:bg-stone-50 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-surface-500 dark:bg-surface-800 dark:text-stone-300 dark:hover:bg-surface-600 dark:hover:text-primary-400 dark:focus:ring-offset-surface-950"
      @click="scrollContainerToTop(scrollContainer)"
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
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  </Teleport>
</template>
