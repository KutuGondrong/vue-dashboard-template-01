import { defineStore } from 'pinia';
import { markRaw, ref, shallowRef } from 'vue';
import { getScrollContainer, resolveScrollContainer } from '@/utils/scrollContainer';

type ScrollMode = 'direct' | 'anchor';

export const useScrollStore = defineStore('scroll', () => {
  const scrollContainer = shallowRef<HTMLElement | null>(null);
  const mode = ref<ScrollMode>('direct');
  const anchorEl = shallowRef<HTMLElement | null>(null);

  function scrollContainerRef(node: HTMLElement | null): void {
    mode.value = 'direct';
    anchorEl.value = null;
    scrollContainer.value = node ? markRaw(resolveScrollContainer(node)) : null;
  }

  function scrollAnchorRef(node: HTMLElement | null): void {
    mode.value = 'anchor';
    anchorEl.value = node ? markRaw(node) : null;
    scrollContainer.value = node ? markRaw(getScrollContainer(node)) : null;
  }

  function updateFromAnchor(): void {
    if (mode.value === 'anchor' && anchorEl.value) {
      scrollContainer.value = markRaw(getScrollContainer(anchorEl.value));
    }
  }

  return {
    scrollContainer,
    scrollContainerRef,
    scrollAnchorRef,
    updateFromAnchor,
  };
});

/** Composable for scroll container ref binding */
export function useScrollContainerRef() {
  const store = useScrollStore();
  return store.scrollContainerRef;
}

/** Composable for scroll anchor ref binding */
export function useScrollAnchorRef() {
  const store = useScrollStore();
  return store.scrollAnchorRef;
}
