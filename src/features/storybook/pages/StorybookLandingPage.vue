<script setup lang="ts">
import { externalLinksConfig } from '@/config/externalLinks';
import DevFeatureBanner from '@/components/DevFeatureBanner/DevFeatureBanner.vue';
import { Typography } from '@/components/Typography';
import { useStorybookLocale } from '@/features/storybook/stores/storybookLocaleStore';

const { t } = useStorybookLocale();
const componentsUrl = externalLinksConfig.componentsUrl;
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-6 pb-10">
    <div class="space-y-3">
      <Typography.Title :level="2">
        {{ t('landingTitle') }}
      </Typography.Title>
      <Typography.Text color="muted">
        {{ t('landingSubtitle') }}
      </Typography.Text>
    </div>

    <DevFeatureBanner
      :title="t('landingDevBannerTitle')"
      :description="t('landingDevBannerDescription')"
    />

    <div
      class="space-y-4 rounded-xl border border-stone-200 bg-white p-6 dark:border-surface-600 dark:bg-surface-800"
    >
      <Typography.Text>{{ t('landingDescription') }}</Typography.Text>
      <Typography.Text
        color="muted"
        class="text-sm"
      >
        {{ t('landingHint') }}
      </Typography.Text>
      <a
        :href="componentsUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
      >
        {{ t('landingLinkLabel') }}
        <span aria-hidden="true">↗</span>
      </a>
      <Typography.Text
        color="muted"
        class="block text-xs"
      >
        {{ t('landingUrlNote', { url: componentsUrl }) }}
      </Typography.Text>
    </div>
  </div>
</template>
