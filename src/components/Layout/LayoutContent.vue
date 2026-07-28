<script setup lang="ts">
import { cn } from './layoutUtils';
</script>

<template>
  <main :class="cn('min-h-0 flex-1 overflow-auto p-4 text-sm text-stone-700 dark:text-stone-300')">
    <slot />
  </main>
</template>
