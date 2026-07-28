<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    active?: boolean;
  }>(),
  { active: false },
);

const emit = defineEmits<{
  click: [];
}>();

const pillClass = computed(
  () =>
    `rounded-full px-3 py-1 text-sm font-medium transition-colors ${
      props.active
        ? 'bg-primary-600 text-white dark:bg-primary-500'
        : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-surface-600 dark:text-stone-300 dark:hover:bg-surface-500'
    }`,
);
</script>

<template>
  <button
    type="button"
    :class="pillClass"
    @click="emit('click')"
  >
    <slot />
  </button>
</template>
