<script setup lang="ts">
import { cn } from '@/components/Layout/layoutUtils';
import { useLocale } from '@/locales/localeStore';
import NavMenuPathTarget from './NavMenuPathTarget.vue';
import NavMenuIcon from './NavMenuIcon.vue';
import { rowBase, rowPadding, rowActive, rowDefault, isItemActive } from './navMenuUtils';
import type { ItemContext, NavMenuItem } from './navMenu.types';

const props = defineProps<{
  item: NavMenuItem;
  ctx: ItemContext;
  expanded: boolean;
}>();

const emit = defineEmits<{ toggle: []; navigate: [] }>();

const { t } = useLocale();

const isActive = () => isItemActive(props.item, props.ctx.pathname);
</script>

<template>
  <div
    :class="
      cn(
        rowBase,
        rowPadding(ctx.depth, ctx.collapsed),
        'gap-1',
        isActive() ? rowActive : rowDefault,
      )
    "
  >
    <NavMenuPathTarget
      :path="item.path!"
      :end="item.end"
      :on-after-navigate="() => emit('navigate')"
      :ctx="ctx"
      variant="inline"
      :row-class="
        (linkActive) =>
          cn(
            'min-w-0 flex-1 gap-3 truncate',
            linkActive ? 'text-primary-700 dark:text-primary-300' : '',
          )
      "
    >
      <NavMenuIcon :icon="item.icon" />
      <span class="min-w-0 flex-1 truncate text-left">{{ item.label }}</span>
      <span
        v-if="item.devBadge"
        class="shrink-0"
      >
        <span
          class="rounded bg-yellow-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
        >
          DEV
        </span>
      </span>
    </NavMenuPathTarget>
    <button
      type="button"
      :aria-expanded="expanded"
      :aria-label="`${expanded ? t('components.common.collapse') : t('components.common.expand')} ${item.label}`"
      class="relative z-10 flex shrink-0 items-center justify-center rounded-md p-1.5 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-surface-700 dark:hover:text-stone-300"
      @click.stop.prevent="emit('toggle')"
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
    </button>
  </div>
</template>
