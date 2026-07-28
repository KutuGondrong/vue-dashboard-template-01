<script setup lang="ts">
import AppErrorBoundary from '@/components/AppErrorBoundary/AppErrorBoundary.vue';
import { ToastHost } from '@/components/Toast';
import { ModalHost } from '@/components/Modal';
</script>

<template>
  <AppErrorBoundary>
    <ToastHost>
      <ModalHost>
        <RouterView />
      </ModalHost>
    </ToastHost>
  </AppErrorBoundary>
</template>
