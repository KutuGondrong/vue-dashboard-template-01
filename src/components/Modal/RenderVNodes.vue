<script setup lang="ts">
import type { VNode } from 'vue';

defineProps<{
  vnodes: VNode | VNode[];
}>();
</script>

<template>
  <component :is="{ render: () => vnodes }" />
</template>
