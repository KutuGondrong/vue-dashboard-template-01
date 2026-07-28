<script setup lang="ts">
import { computed, h, isVNode, cloneVNode, type Component, type VNode } from 'vue';

const props = defineProps<{
  icon?: VNode | Component;
}>();

const iconRender = computed(() => {
  if (!props.icon) return null;
  if (isVNode(props.icon)) return () => cloneVNode(props.icon as VNode);
  return () => h(props.icon as Component);
});
</script>

<template>
  <span
    v-if="iconRender"
    class="flex h-5 w-5 shrink-0 items-center justify-center [&>svg]:h-5 [&>svg]:w-5"
  >
    <component :is="iconRender" />
  </span>
</template>
