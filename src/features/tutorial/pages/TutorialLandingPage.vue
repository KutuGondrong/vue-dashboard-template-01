<script setup lang="ts">
import { externalLinksConfig } from '@/config/externalLinks';
import TypographyTitle from '@/components/Typography/TypographyTitle.vue';
import TypographyText from '@/components/Typography/TypographyText.vue';
import TutorialDevBanner from '@/features/tutorial/components/TutorialDevBanner.vue';
import { useTutorialLocale } from '@/features/tutorial/stores/tutorialLocaleStore';

const { t } = useTutorialLocale();
const docsUrl = externalLinksConfig.tutorialUrl;
const repoUrl = externalLinksConfig.templateRepoUrl;
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-6 pb-10">
    <div class="space-y-3">
      <TypographyTitle :level="2">
        {{ t('landingTitle') }}
      </TypographyTitle>
      <TypographyText color="muted">
        {{ t('landingSubtitle') }}
      </TypographyText>
    </div>

    <TutorialDevBanner />

    <div
      class="space-y-4 rounded-xl border border-stone-200 bg-white p-6 dark:border-surface-600 dark:bg-surface-800"
    >
      <TypographyText>{{ t('landingDescription') }}</TypographyText>
      <TypographyText
        color="muted"
        class="text-sm"
      >
        {{ t('landingHint') }}
      </TypographyText>
      <TypographyText
        color="muted"
        class="block text-xs"
      >
        {{ t('landingRepoNote', { url: repoUrl }) }}
      </TypographyText>
      <a
        :href="docsUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
      >
        {{ t('landingLinkLabel') }}
        <span aria-hidden="true">↗</span>
      </a>
      <TypographyText
        color="muted"
        class="block text-xs"
      >
        {{ t('landingUrlNote', { url: docsUrl }) }}
      </TypographyText>
    </div>
  </div>
</template>
