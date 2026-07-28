<script setup lang="ts">
import { ref, computed } from 'vue';
import NavMenuNodeContent from './NavMenuNodeContent.vue';
import NavMenuFlyout from './NavMenuFlyout.vue';
import NavMenuChildren from './NavMenuChildren.vue';
import { isItemActive } from './navMenuUtils';
import type { ItemContext, NavMenuItem } from './navMenu.types';

const props = defineProps<{
  item: NavMenuItem;
  ctx: ItemContext;
}>();

const flyoutAnchorRef = ref<HTMLElement | null>(null);

const hasChildren = computed(() => Boolean(props.item.children?.length));
const isOpen = computed(() => props.ctx.openKeys.has(props.item.key));
const isFlyoutOpen = computed(() => props.ctx.flyoutKey === props.item.key);
const showChildren = computed(() => !props.ctx.collapsed && hasChildren.value && isOpen.value);
</script>

<template>
  <div
    ref="flyoutAnchorRef"
    :class="ctx.collapsed && hasChildren ? 'relative' : undefined"
  >
    <NavMenuNodeContent
      :item="item"
      :ctx="ctx"
    />
    <NavMenuFlyout
      v-if="ctx.collapsed && hasChildren && isFlyoutOpen"
      :item="item"
      :ctx="ctx"
      :anchor-ref="flyoutAnchorRef"
    />
    <NavMenuChildren
      v-if="showChildren"
      :items="item.children!"
      :ctx="ctx"
      :branch-active="isItemActive(item, ctx.pathname)"
    />
  </div>
</template>
