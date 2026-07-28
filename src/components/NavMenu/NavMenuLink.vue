<script setup lang="ts">
import { cn } from '@/components/Layout/layoutUtils';
import NavMenuPathTarget from './NavMenuPathTarget.vue';
import NavMenuIcon from './NavMenuIcon.vue';
import {
  rowPadding,
  childActive,
  childDefault,
  rowActive,
  rowDefault,
  getFlyoutDismissOnAction,
} from './navMenuUtils';
import type { ItemContext, NavMenuItem } from './navMenu.types';

const props = defineProps<{
  item: NavMenuItem;
  ctx: ItemContext;
}>();

function dismissFlyoutIfNeeded() {
  if (!props.ctx.inFlyout) return;
  if (getFlyoutDismissOnAction(props.item, props.ctx.flyoutDismissOnAction)) {
    props.ctx.onFlyoutToggle(null);
  }
}

function rowClass(isActive: boolean) {
  const isChild = props.ctx.depth > 0;
  return cn(
    rowPadding(props.ctx.depth, props.ctx.collapsed),
    isChild ? (isActive ? childActive : childDefault) : isActive ? rowActive : rowDefault,
  );
}
</script>

<template>
  <NavMenuPathTarget
    :path="item.path!"
    :end="item.end"
    :title="ctx.collapsed ? item.label : undefined"
    :on-after-navigate="dismissFlyoutIfNeeded"
    :ctx="ctx"
    :row-class="rowClass"
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
    </template>
  </NavMenuPathTarget>
</template>
