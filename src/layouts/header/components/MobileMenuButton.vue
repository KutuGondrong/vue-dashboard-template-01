<script setup lang="ts">
defineProps<{ isOpen: boolean; label: string }>();
defineEmits<{ click: [] }>();
</script>

<template>
  <button
    type="button"
    class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-stone-600 transition-colors hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:scale-95 lg:hidden dark:text-stone-300 dark:hover:bg-surface-700 dark:focus:ring-offset-surface-900"
    :aria-label="label"
    :aria-expanded="isOpen"
    aria-controls="mobile-nav-drawer"
    @click="$emit('click')"
  >
    <svg
      v-if="isOpen"
      class="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
    <svg
      v-else
      class="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  </button>
</template>
