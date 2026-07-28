<script setup lang="ts">
import { computed } from 'vue';
import { useLocale } from '@/locales/localeStore';

const props = withDefaults(
  defineProps<{
    class?: string;
    height?: number;
    /** Prefer points.length from the live chart; fallback 7. */
    count?: number;
  }>(),
  {
    class: '',
    height: 220,
    count: 7,
  },
);

const { t } = useLocale();
const loadingCount = computed(() => Math.max(props.count, 7));
const loadingBars = computed(() =>
  Array.from({ length: loadingCount.value }, (_, index) => ({
    heightPct: 35 + ((index * 17) % 50),
  })),
);
</script>

<template>
  <div
    :class="`flex w-full min-w-0 items-end gap-2 px-1 ${props.class}`"
    :style="{ height: `${height}px` }"
    role="status"
    :aria-label="t('components.common.loading')"
  >
    <div
      v-for="(bar, index) in loadingBars"
      :key="index"
      class="flex-1 animate-pulse rounded-t bg-stone-200 dark:bg-surface-600"
      :style="{ height: `${bar.heightPct}%` }"
    />
  </div>
</template>
