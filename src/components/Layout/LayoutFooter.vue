<script setup lang="ts">
import { cn } from './layoutUtils';

withDefaults(defineProps<{ sticky?: boolean }>(), { sticky: false });
</script>

<template>
  <footer
    :class="
      cn(
        'flex shrink-0 items-center border-t border-stone-200 bg-stone-50 px-4 py-3 text-xs text-stone-500 dark:border-surface-600 dark:bg-surface-800/80 dark:text-stone-400',
        sticky && 'sticky bottom-0 z-10',
      )
    "
  >
    <slot />
  </footer>
</template>
