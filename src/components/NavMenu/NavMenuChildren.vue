<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { cn } from '@/components/Layout/layoutUtils';
import NavMenuNode from './NavMenuNode.vue';
import NavMenuNodeContent from './NavMenuNodeContent.vue';
import NavMenuChildren from './NavMenuChildren.vue';
import {
  treeChildrenMargin,
  getDirectChildRows,
  isItemActive,
  TREE_BRANCH_W,
  TREE_BRANCH_PEEK,
} from './navMenuUtils';
import type { ItemContext, NavMenuItem } from './navMenu.types';

const props = defineProps<{
  items: NavMenuItem[];
  ctx: ItemContext;
  branchActive?: boolean;
}>();

const wrapperRef = ref<HTMLElement | null>(null);
const trunkTop = ref<number | null>(null);
const trunkHeight = ref<number | null>(null);

const childCtx = computed(() => ({ ...props.ctx, depth: props.ctx.depth + 1 }));

function measureTrunk() {
  const wrapper = wrapperRef.value;
  if (!wrapper) return;

  const rows = getDirectChildRows(wrapper);
  if (rows.length < 2) {
    trunkTop.value = null;
    trunkHeight.value = null;
    return;
  }

  const wrapperTop = wrapper.getBoundingClientRect().top;
  const firstRow = rows[0];
  const lastRow = rows[rows.length - 1];
  const firstMid =
    firstRow.getBoundingClientRect().top + firstRow.getBoundingClientRect().height / 2;
  const lastMid = lastRow.getBoundingClientRect().top + lastRow.getBoundingClientRect().height / 2;

  trunkTop.value = firstMid - wrapperTop;
  trunkHeight.value = lastMid - firstMid;
}

let resizeObserver: ResizeObserver | null = null;
const observedRows = new Set<HTMLElement>();

function syncRowObservers() {
  const wrapper = wrapperRef.value;
  if (!wrapper || !resizeObserver) return;

  const rows = new Set(getDirectChildRows(wrapper));
  for (const row of observedRows) {
    if (!rows.has(row)) {
      resizeObserver.unobserve(row);
      observedRows.delete(row);
    }
  }
  for (const row of rows) {
    if (!observedRows.has(row)) {
      resizeObserver.observe(row);
      observedRows.add(row);
    }
  }
}

onMounted(() => {
  void nextTick(() => {
    measureTrunk();
    const wrapper = wrapperRef.value;
    if (!wrapper) return;
    resizeObserver = new ResizeObserver(() => {
      measureTrunk();
      syncRowObservers();
    });
    resizeObserver.observe(wrapper);
    syncRowObservers();
  });
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
  observedRows.clear();
});

watch(
  () =>
    [
      props.items,
      props.ctx.openKeys,
      props.branchActive,
      props.ctx.pathname,
      props.ctx.childConnector,
    ] as const,
  () => {
    void nextTick(() => {
      measureTrunk();
      syncRowObservers();
    });
  },
  { flush: 'post' },
);

const showVerticalTrunk = computed(() => trunkHeight.value != null && trunkHeight.value > 0);
const upwardConnectorHeight = computed(() =>
  props.branchActive && trunkTop.value != null && trunkTop.value > 0 ? trunkTop.value : null,
);

function childIsOpen(child: NavMenuItem) {
  return (
    props.ctx.openKeys.has(child.key) && !props.ctx.collapsed && Boolean(child.children?.length)
  );
}
</script>

<template>
  <div
    v-if="ctx.childConnector === 'none'"
    class="ml-3 mt-1 space-y-1"
  >
    <NavMenuNode
      v-for="child in items"
      :key="child.key"
      :item="child"
      :ctx="childCtx"
    />
  </div>
  <div
    v-else
    ref="wrapperRef"
    :class="cn('relative mt-1 overflow-hidden', treeChildrenMargin())"
  >
    <span
      v-if="upwardConnectorHeight != null"
      class="pointer-events-none absolute left-0 top-0 z-[1] w-px bg-stone-200 dark:bg-surface-600"
      :style="{ height: `${upwardConnectorHeight}px` }"
      aria-hidden="true"
    />
    <span
      v-if="showVerticalTrunk"
      class="pointer-events-none absolute left-0 z-[1] w-px bg-stone-200 dark:bg-surface-600"
      :style="{ top: `${trunkTop ?? 0}px`, height: `${trunkHeight ?? 0}px` }"
      aria-hidden="true"
    />
    <ul class="list-none space-y-1">
      <li
        v-for="child in items"
        :key="child.key"
      >
        <div class="flex">
          <div
            class="pointer-events-none relative shrink-0 self-stretch"
            :style="{ width: `${TREE_BRANCH_W}px` }"
          >
            <span
              class="absolute left-0 top-1/2 z-[1] h-px -translate-y-1/2 bg-stone-200 dark:bg-surface-600"
              :style="{
                width: `${isItemActive(child, ctx.pathname) ? TREE_BRANCH_W : TREE_BRANCH_W + TREE_BRANCH_PEEK}px`,
              }"
              aria-hidden="true"
            />
          </div>
          <div
            class="min-w-0 flex-1 self-stretch"
            data-nav-tree-row
          >
            <NavMenuNodeContent
              :item="child"
              :ctx="childCtx"
            />
          </div>
        </div>
        <NavMenuChildren
          v-if="childIsOpen(child)"
          :items="child.children!"
          :ctx="childCtx"
          :branch-active="isItemActive(child, ctx.pathname)"
        />
      </li>
    </ul>
  </div>
</template>
