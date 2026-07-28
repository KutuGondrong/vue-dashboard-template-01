<script setup lang="ts">
import { ref, watch } from 'vue';
import { useScrollAnchorRef } from '@/layouts/main-layout/stores/scrollStore';

defineProps<{
  class?: string;
}>();

const scrollAnchorRef = useScrollAnchorRef();
const anchorRef = ref<HTMLElement | null>(null);

watch(
  anchorRef,
  (node) => {
    scrollAnchorRef(node);
  },
  { immediate: true },
);
</script>

<template>
  <div
    ref="anchorRef"
    :class="$props.class"
  >
    <slot />
  </div>
</template>
