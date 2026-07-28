<script setup lang="ts">
import { computed } from 'vue';
import NavMenuLink from './NavMenuLink.vue';
import NavMenuParentNavigateRow from './NavMenuParentNavigateRow.vue';
import NavMenuParentExpandRow from './NavMenuParentExpandRow.vue';
import NavMenuButton from './NavMenuButton.vue';
import { isNavigateParent, getFlyoutDismissOnAction } from './navMenuUtils';
import type { ItemContext, NavMenuItem } from './navMenu.types';

const props = defineProps<{
  item: NavMenuItem;
  ctx: ItemContext;
}>();

const hasChildren = computed(() => Boolean(props.item.children?.length));
const isOpen = computed(() => props.ctx.openKeys.has(props.item.key));
const isFlyoutOpen = computed(() => props.ctx.flyoutKey === props.item.key);

function dismissFlyoutIfNeeded() {
  if (!props.ctx.inFlyout) return;
  if (getFlyoutDismissOnAction(props.item, props.ctx.flyoutDismissOnAction)) {
    props.ctx.onFlyoutToggle(null);
  }
}

function handleClick() {
  if (props.ctx.collapsed && hasChildren.value && !props.ctx.inFlyout) {
    if (isFlyoutOpen.value) {
      props.ctx.onFlyoutToggle(null);
    } else {
      props.ctx.onFlyoutToggle(props.item.key);
      props.item.onClick?.();
    }
    return;
  }
  if (hasChildren.value) props.ctx.onToggle(props.item.key);
  props.item.onClick?.();
  if (!hasChildren.value) {
    dismissFlyoutIfNeeded();
    props.ctx.onActivate?.(props.item.path);
  }
}

function handleToggleOnly() {
  if (hasChildren.value) props.ctx.onToggle(props.item.key);
}

function handleParentNavigate() {
  props.ctx.ensureOpen(props.item.key);
  props.item.onClick?.();
}

const showLink = computed(() => !hasChildren.value && props.item.path && !props.item.onClick);
const showSplitParent = computed(() => hasChildren.value && !props.ctx.collapsed);
const showNavigateParent = computed(() => showSplitParent.value && isNavigateParent(props.item));
const showExpandParent = computed(() => showSplitParent.value && !isNavigateParent(props.item));
</script>

<template>
  <NavMenuLink
    v-if="showLink"
    :item="item"
    :ctx="ctx"
  />
  <NavMenuParentNavigateRow
    v-else-if="showNavigateParent"
    :item="item"
    :ctx="ctx"
    :expanded="isOpen"
    @toggle="handleToggleOnly"
    @navigate="handleParentNavigate"
  />
  <NavMenuParentExpandRow
    v-else-if="showExpandParent"
    :item="item"
    :ctx="ctx"
    :expanded="isOpen"
    @toggle="handleToggleOnly"
    @main-click="handleClick"
  />
  <NavMenuButton
    v-else
    :item="item"
    :ctx="ctx"
    :expanded="isOpen"
    @click="handleClick"
  />
</template>
