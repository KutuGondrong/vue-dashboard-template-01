<script setup lang="ts">
type AnimatedBackgroundVariant = 'auth' | 'dashboard';

withDefaults(
  defineProps<{
    variant?: AnimatedBackgroundVariant;
  }>(),
  { variant: 'auth' },
);
</script>

<template>
  <div
    v-if="variant === 'dashboard'"
    class="pointer-events-none absolute inset-0"
    aria-hidden="true"
  >
    <div class="absolute inset-0 bg-stone-50 dark:bg-surface-950" />
    <div
      class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.06),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.1),transparent_60%)]"
    />
  </div>
  <div
    v-else
    class="pointer-events-none absolute inset-0"
    aria-hidden="true"
  >
    <div class="absolute inset-0 bg-stone-50 dark:bg-surface-950" />
    <div
      class="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-transparent to-transparent dark:from-primary-950/25 dark:via-transparent"
    />
  </div>
</template>
