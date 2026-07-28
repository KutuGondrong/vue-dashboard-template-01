<script setup lang="ts">
import AuthLayoutCard from '@/layouts/main-layout/components/AuthLayoutCard.vue';
import AuthLayoutToolbar from '@/layouts/main-layout/components/AuthLayoutToolbar.vue';
import ScrollProvider from '@/layouts/main-layout/components/ScrollProvider.vue';
</script>

<template>
  <ScrollProvider>
    <div class="relative min-h-screen overflow-hidden rounded-none border-0">
      <div
        class="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div class="absolute inset-0 bg-stone-50 dark:bg-surface-950" />
        <div
          class="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-transparent to-transparent dark:from-primary-950/25 dark:via-transparent"
        />
      </div>
      <AuthLayoutToolbar />
      <main
        class="relative flex min-h-screen items-center justify-center border-0 bg-transparent px-4 py-8 sm:px-6 sm:py-12"
      >
        <AuthLayoutCard>
          <RouterView />
        </AuthLayoutCard>
      </main>
    </div>
  </ScrollProvider>
</template>
