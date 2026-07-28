<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue';
import { cn } from '@/components/Layout/layoutUtils';
import { useScrollContainerRef } from '@/layouts/main-layout/stores/scrollStore';

defineProps<{
  class?: string;
}>();

const scrollContainerRef = useScrollContainerRef();
const rootRef = ref<HTMLElement | null>(null);

function bindScrollContainer(node: HTMLElement | null): void {
  scrollContainerRef(node);
}

watch(rootRef, bindScrollContainer, { immediate: true });

let resizeObserver: ResizeObserver | undefined;

watch(
  rootRef,
  (node, _, onCleanup) => {
    resizeObserver?.disconnect();
    resizeObserver = undefined;

    if (!node) return;

    resizeObserver = new ResizeObserver(() => {
      bindScrollContainer(node);
    });
    resizeObserver.observe(node);
    for (const child of node.children) {
      if (child instanceof HTMLElement) {
        resizeObserver.observe(child);
      }
    }

    onCleanup(() => {
      resizeObserver?.disconnect();
      resizeObserver = undefined;
    });
  },
  { immediate: true },
);

onUnmounted(() => {
  resizeObserver?.disconnect();
});
</script>

<template>
  <main
    ref="rootRef"
    :class="
      cn(
        'relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-4 text-sm text-stone-700 dark:text-stone-300',
        $props.class,
      )
    "
  >
    <slot />
  </main>
</template>
