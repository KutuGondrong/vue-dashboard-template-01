<script setup lang="ts">
import AuthBrand from '@/layouts/main-layout/components/AuthBrand.vue';
import { ScrollAnchor } from '@/components/ScrollToTop';
</script>

<template>
  <ScrollAnchor
    class="w-full max-w-[420px] rounded-2xl border border-stone-200 bg-white px-6 py-8 shadow-lg sm:px-8 sm:py-10 dark:border-surface-600 dark:bg-surface-800"
  >
    <AuthBrand />
    <div
      class="my-7 border-t border-stone-100 dark:border-surface-600"
      aria-hidden="true"
    />
    <slot />
  </ScrollAnchor>
</template>
