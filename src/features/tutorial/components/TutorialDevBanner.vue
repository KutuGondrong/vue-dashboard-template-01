<script setup lang="ts">
import DevFeatureBanner from '@/components/DevFeatureBanner/DevFeatureBanner.vue';
import { useTutorialLocale } from '@/features/tutorial/stores/tutorialLocaleStore';

const { t } = useTutorialLocale();
</script>

<template>
  <DevFeatureBanner
    :title="t('devBannerTitle')"
    :description="t('devBannerDescription')"
  />
</template>
