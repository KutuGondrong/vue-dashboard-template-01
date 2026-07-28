<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { cn } from '@/components/Layout/layoutUtils';
import { Typography } from '@/components/Typography';

export type CardVariant = 'default' | 'alternate';

export interface CardProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  href?: string;
  variant?: CardVariant;
  clickable?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<CardProps>(), {
  variant: 'default',
  clickable: false,
  class: '',
});

const VARIANT_CLASSES: Record<CardVariant, string> = {
  default: 'border-stone-200 bg-white dark:border-surface-600 dark:bg-surface-800',
  alternate: 'border-primary-100 bg-primary-50 dark:border-surface-500 dark:bg-surface-800',
};

const CLICKABLE_CARD_CLASSES =
  'group transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md dark:hover:border-primary-700';

const isWholeCardClickable = computed(() => props.clickable && Boolean(props.href));
const actionHref = computed(() =>
  props.href && props.actionLabel && !isWholeCardClickable.value ? props.href : undefined,
);

const surfaceClasses = computed(() =>
  cn(
    'flex flex-col rounded-xl border p-5 shadow-sm',
    VARIANT_CLASSES[props.variant],
    isWholeCardClickable.value && CLICKABLE_CARD_CLASSES,
    props.class,
  ),
);
</script>

<template>
  <RouterLink
    v-if="isWholeCardClickable"
    :to="href!"
    :class="surfaceClasses"
  >
    <Typography.Text
      v-if="title"
      weight="semibold"
      :class="
        cn(
          'text-base text-stone-900 dark:text-stone-100',
          'transition-colors group-hover:text-primary-700 dark:group-hover:text-primary-300',
        )
      "
    >
      {{ title }}
    </Typography.Text>

    <slot />

    <Typography.Text
      v-if="description"
      color="muted"
      :class="cn('flex-1 text-sm leading-relaxed', $slots.default || title ? 'mt-3' : undefined)"
    >
      {{ description }}
    </Typography.Text>

    <span
      v-if="actionLabel"
      class="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400"
    >
      {{ actionLabel }}
      <svg
        class="h-4 w-4 transition-transform group-hover:translate-x-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </span>
  </RouterLink>

  <article
    v-else
    :class="surfaceClasses"
  >
    <Typography.Text
      v-if="title"
      weight="semibold"
      class="text-base text-stone-900 dark:text-stone-100"
    >
      {{ title }}
    </Typography.Text>

    <slot />

    <Typography.Text
      v-if="description"
      color="muted"
      :class="cn('flex-1 text-sm leading-relaxed', $slots.default || title ? 'mt-3' : undefined)"
    >
      {{ description }}
    </Typography.Text>

    <RouterLink
      v-if="actionLabel && actionHref"
      :to="actionHref"
      class="group/action mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
    >
      {{ actionLabel }}
      <svg
        class="h-4 w-4 transition-transform group-hover/action:translate-x-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </RouterLink>

    <span
      v-else-if="actionLabel"
      class="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400"
    >
      {{ actionLabel }}
      <svg
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </span>
  </article>
</template>
