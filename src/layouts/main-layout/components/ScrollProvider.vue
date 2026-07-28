<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import ScrollToTop from '@/components/ScrollToTop/ScrollToTop.vue';
import { isScrollToTopEnabled } from '@/config/scrollToTop';
import { useScrollStore } from '@/layouts/main-layout/stores/scrollStore';
import { resetScrollPosition } from '@/utils/scrollContainer';

const route = useRoute();
const scrollStore = useScrollStore();
const { scrollContainer } = storeToRefs(scrollStore);
const previousPath = ref<string | null>(null);

onMounted(() => {
  previousPath.value = route.path;
});

watch(
  () => route.path,
  (path) => {
    scrollStore.updateFromAnchor();

    const container = scrollContainer.value;
    const isNavigation = previousPath.value !== null && previousPath.value !== path;
    previousPath.value = path;

    if (!container || !isNavigation || route.hash) return;
    resetScrollPosition(container);
  },
);
</script>

<template>
  <slot />
  <ScrollToTop
    v-if="isScrollToTopEnabled && scrollContainer"
    :scroll-container="scrollContainer"
  />
</template>
