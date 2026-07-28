<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Button } from '@/components/Button';
import { Typography } from '@/components/Typography';
import { useLocaleStore } from '@/locales/localeStore';

const localeStore = useLocaleStore();
const router = useRouter();
const isDev = import.meta.env.DEV;

function goToDashboard(): void {
  router.push('/dashboard');
}
</script>

<template>
  <div class="flex min-h-[50vh] flex-1 flex-col items-center justify-center px-4 py-12 text-center">
    <p class="text-6xl font-bold tabular-nums text-primary-600 dark:text-primary-400">
      404
    </p>
    <Typography.Title
      :level="2"
      align="center"
      class="mt-4"
    >
      {{ localeStore.t('errors.notFound.title') }}
    </Typography.Title>
    <Typography.Text
      color="muted"
      align="center"
      class="mt-2 max-w-md"
    >
      {{ localeStore.t('errors.notFound.description') }}
    </Typography.Text>
    <Typography.Text
      v-if="isDev"
      color="muted"
      align="center"
      class="mt-3 max-w-md text-xs"
    >
      {{ localeStore.t('errors.notFound.descriptionDev') }}
    </Typography.Text>
    <Button
      class="mt-8"
      @click="goToDashboard"
    >
      {{ localeStore.t('errors.notFound.backToDashboard') }}
    </Button>
  </div>
</template>
