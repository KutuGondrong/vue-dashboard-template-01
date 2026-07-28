<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/components/Layout/layoutUtils';
import NavMenuIcon from './NavMenuIcon.vue';
import {
  rowBase,
  rowPadding,
  rowActive,
  rowDefault,
  childActive,
  childDefault,
  isItemActive,
} from './navMenuUtils';
import type { ItemContext, NavMenuItem } from './navMenu.types';

const props = defineProps<{
  item: NavMenuItem;
  ctx: ItemContext;
  expanded?: boolean;
}>();

const emit = defineEmits<{ click: [] }>();

const isActive = computed(() => isItemActive(props.item, props.ctx.pathname));
const showChevron = computed(() => Boolean(props.item.children?.length) && !props.ctx.collapsed);
</script>

<template>
  <button
    type="button"
    :title="ctx.collapsed ? item.label : undefined"
    :class="
      cn(
        rowBase,
        rowPadding(ctx.depth, ctx.collapsed),
        ctx.depth > 0 ? (isActive ? childActive : childDefault) : isActive ? rowActive : rowDefault,
      )
    "
    @click="emit('click')"
  >
    <NavMenuIcon :icon="item.icon" />
    <template v-if="!ctx.collapsed">
      <span class="truncate">{{ item.label }}</span>
      <span
        v-if="item.devBadge"
        class="ml-auto shrink-0"
      >
        <span
          class="rounded bg-yellow-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
        >
          DEV
        </span>
      </span>
      <span
        v-if="showChevron"
        class="ml-auto shrink-0"
      >
        <svg
          :class="cn('h-4 w-4 shrink-0 transition-transform', expanded && 'rotate-90')"
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
    </template>
  </button>
</template>
