<script setup lang="ts">
defineProps<{
  title: string;
  subtitle: string;
}>();
</script>

<template>
  <div class="mb-6 text-center">
    <h1 class="text-xl font-semibold tracking-tight text-stone-900 dark:text-white">
      {{ title }}
    </h1>
    <p class="mt-1.5 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
      {{ subtitle }}
    </p>
  </div>
</template>
