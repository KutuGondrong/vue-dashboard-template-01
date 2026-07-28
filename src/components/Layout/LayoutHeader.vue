<script setup lang="ts">
import { cn } from './layoutUtils';

withDefaults(defineProps<{ sticky?: boolean }>(), { sticky: false });
</script>

<template>
  <header
    :class="
      cn(
        'flex shrink-0 items-center border-b border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-800 dark:border-surface-600 dark:bg-surface-800/80 dark:text-stone-100',
        sticky && 'sticky top-0 z-10',
      )
    "
  >
    <slot />
  </header>
</template>
