<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, type Ref } from 'vue';
import { useLocale } from '@/locales/localeStore';
import NavMenuNode from './NavMenuNode.vue';
import type { ItemContext, NavMenuItem } from './navMenu.types';

const props = defineProps<{
  item: NavMenuItem;
  ctx: ItemContext;
  anchorRef: Ref<HTMLElement | null>;
}>();

const { t } = useLocale();

const position = ref<{ top: number; left: number } | null>(null);

function updatePosition() {
  const anchor = props.anchorRef.value;
  if (!anchor) return;
  const rect = anchor.getBoundingClientRect();
  position.value = { top: rect.top, left: rect.right + 8 };
}

onMounted(() => {
  void nextTick(updatePosition);
  window.addEventListener('scroll', updatePosition, true);
  window.addEventListener('resize', updatePosition);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updatePosition, true);
  window.removeEventListener('resize', updatePosition);
});

watch(
  () => props.ctx.flyoutKey,
  () => {
    void nextTick(updatePosition);
  },
);

const flyoutCtx = computed(() => ({
  ...props.ctx,
  depth: props.ctx.depth + 1,
  collapsed: false,
  inFlyout: true,
}));
</script>

<template>
  <Teleport
    v-if="position != null"
    to="body"
  >
    <div
      class="fixed z-[200] min-w-[180px] rounded-lg border border-stone-200 bg-white py-1 shadow-lg dark:border-surface-600 dark:bg-surface-800"
      :style="{ top: `${position.top}px`, left: `${position.left}px` }"
      role="menu"
    >
      <div
        class="flex items-center gap-2 border-b border-stone-200 px-3 py-2 dark:border-surface-600"
      >
        <button
          type="button"
          class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-stone-200 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:border-surface-600 dark:hover:bg-surface-700 dark:hover:text-stone-300"
          :aria-label="t('components.common.closeSubmenu')"
          @click="ctx.onFlyoutToggle(null)"
        >
          <svg
            class="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <span
          class="flex min-w-0 flex-1 items-center gap-2 truncate text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400"
        >
          {{ item.label }}
          <span
            v-if="item.devBadge"
            class="rounded bg-yellow-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
          >
            DEV
          </span>
        </span>
      </div>
      <div class="space-y-1 p-1.5 pt-2">
        <NavMenuNode
          v-for="child in item.children"
          :key="child.key"
          :item="child"
          :ctx="flyoutCtx"
        />
      </div>
    </div>
  </Teleport>
</template>
