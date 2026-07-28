<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useSlots, watch, type CSSProperties } from 'vue';
import { cn } from '@/components/Layout/layoutUtils';
import { getScrollContainer } from '@/utils/scrollContainer';

const DEFAULT_FILL_MIN_HEIGHT = 320;

const props = withDefaults(
  defineProps<{
    class?: string;
    fillHeight?: boolean;
    minHeight?: number;
  }>(),
  {
    class: '',
    fillHeight: false,
    minHeight: DEFAULT_FILL_MIN_HEIGHT,
  },
);

const slots = useSlots();
const rootRef = ref<HTMLDivElement | null>(null);
const bodyRef = ref<HTMLDivElement | null>(null);
const footerRef = ref<HTMLDivElement | null>(null);
const bodyMaxHeight = ref<number | undefined>();

const hasFooter = computed(() => Boolean(slots.footer));
const needsVerticalScroll = ref(false);
const layoutPageContent = ref(false);

const fillHeightActive = computed(() => props.fillHeight && layoutPageContent.value);

const isScrollable = computed(() => needsVerticalScroll.value);

const rootStyle = computed<CSSProperties>(() => {
  if (!fillHeightActive.value) return {};
  return { minHeight: `${props.minHeight}px` };
});

const bodyStyle = computed<CSSProperties>(() => {
  if (bodyMaxHeight.value === undefined) return {};
  return { maxHeight: `${bodyMaxHeight.value}px` };
});

let resizeObserver: ResizeObserver | null = null;
let scrollRafId: number | null = null;
let scrollContainer: HTMLElement | null = null;

/** Skip viewport auto-measure when table sits inside nested page content (e.g. documentation preview). */
function isLayoutPageContent(): boolean {
  const root = rootRef.value;
  if (!root) return false;

  const pageHost = root.closest('[data-layout-page]');
  if (!pageHost) return false;

  let depth = 0;
  let el: HTMLElement | null = root;
  while (el?.parentElement && el.parentElement !== pageHost) {
    depth += 1;
    el = el.parentElement;
  }

  return depth <= 3;
}

function refreshLayoutContext(): void {
  layoutPageContent.value = isLayoutPageContent();
}

function updateVerticalScrollNeed() {
  const bodyEl = bodyRef.value;
  if (!bodyEl) {
    needsVerticalScroll.value = false;
    return;
  }

  if (fillHeightActive.value || bodyMaxHeight.value !== undefined) {
    needsVerticalScroll.value = bodyEl.scrollHeight > bodyEl.clientHeight + 1;
    return;
  }

  needsVerticalScroll.value = false;
}

function measure() {
  refreshLayoutContext();

  if (fillHeightActive.value) {
    bodyMaxHeight.value = undefined;
    updateVerticalScrollNeed();
    return;
  }

  if (!layoutPageContent.value) {
    bodyMaxHeight.value = undefined;
    updateVerticalScrollNeed();
    return;
  }

  const root = rootRef.value;
  const bodyEl = bodyRef.value;
  if (!root || !bodyEl) return;

  const footerEl = footerRef.value;
  const container = getScrollContainer(root);
  const containerRect = container.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();
  const available = containerRect.bottom - rootRect.top;
  const footerHeight = footerEl?.offsetHeight ?? 0;
  const needed = bodyEl.scrollHeight + footerHeight;

  if (needed > available + 1 && available > footerHeight) {
    const next = Math.floor(available - footerHeight);
    if (bodyMaxHeight.value !== next) {
      bodyMaxHeight.value = next;
    }
  } else if (bodyMaxHeight.value !== undefined) {
    bodyMaxHeight.value = undefined;
  }

  updateVerticalScrollNeed();
}

function scheduleMeasureOnScroll() {
  if (scrollRafId !== null) return;
  scrollRafId = requestAnimationFrame(() => {
    scrollRafId = null;
    measure();
  });
}

function setupObservers() {
  teardownObservers();

  const root = rootRef.value;
  const bodyEl = bodyRef.value;
  if (!root || !bodyEl) return;

  measure();

  resizeObserver = new ResizeObserver(measure);
  resizeObserver.observe(root);
  resizeObserver.observe(bodyEl);
  if (footerRef.value) resizeObserver.observe(footerRef.value);

  if (layoutPageContent.value && !fillHeightActive.value) {
    scrollContainer = getScrollContainer(root);
    scrollContainer.addEventListener('scroll', scheduleMeasureOnScroll, { passive: true });
  }

  window.addEventListener('resize', measure);
}

function teardownObservers() {
  resizeObserver?.disconnect();
  resizeObserver = null;
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', scheduleMeasureOnScroll);
    scrollContainer = null;
  }
  window.removeEventListener('resize', measure);
  if (scrollRafId !== null) {
    cancelAnimationFrame(scrollRafId);
    scrollRafId = null;
  }
}

onMounted(setupObservers);
onUnmounted(teardownObservers);
watch(() => props.fillHeight, setupObservers);
watch(hasFooter, () => {
  requestAnimationFrame(setupObservers);
});
</script>

<template>
  <div
    ref="rootRef"
    :class="
      cn(
        'overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-surface-600 dark:bg-surface-800',
        'flex min-w-0 flex-col',
        fillHeightActive && 'min-h-0 flex-1',
        props.class,
      )
    "
    :style="Object.keys(rootStyle).length > 0 ? rootStyle : undefined"
  >
    <div
      ref="bodyRef"
      :style="Object.keys(bodyStyle).length > 0 ? bodyStyle : undefined"
      :class="
        cn(
          fillHeightActive && 'min-h-0 flex-1',
          'min-w-0 overflow-x-auto',
          isScrollable && 'overflow-y-auto [overflow-anchor:none]',
        )
      "
    >
      <slot />
    </div>
    <div
      v-if="hasFooter"
      ref="footerRef"
      class="shrink-0 overflow-x-auto border-t border-stone-200 dark:border-surface-600"
    >
      <div class="px-4 py-3">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
