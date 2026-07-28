<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue';
import { cn } from './layoutUtils';
import { SplitterContextKey, type SplitterPanelProps } from './layout.types';

const props = withDefaults(defineProps<SplitterPanelProps>(), {});

const ctx = inject(SplitterContextKey);
const panelIndex = ref(-1);

onMounted(() => {
  if (ctx) {
    panelIndex.value = ctx.registerPanel(props);
  }
});

const size = computed(() => {
  if (!ctx || panelIndex.value < 0) return 50;
  return ctx.sizes()[panelIndex.value] ?? 100 / ctx.panelCount();
});

const isLast = computed(() => {
  if (!ctx || panelIndex.value < 0) return true;
  return panelIndex.value === ctx.panelCount() - 1;
});

function handleMouseDown(event: MouseEvent) {
  if (!ctx || panelIndex.value < 0) return;
  event.preventDefault();
  const pos = ctx.direction === 'horizontal' ? event.clientX : event.clientY;
  ctx.startDrag(panelIndex.value, pos);
}

const direction = computed(() => ctx?.direction ?? 'horizontal');
</script>

<template>
  <template v-if="ctx">
    <div
      class="min-h-0 min-w-0 overflow-auto"
      :style="{
        flexBasis: `${size}%`,
        flexGrow: 0,
        flexShrink: 0,
      }"
    >
      <slot />
    </div>
    <div
      v-if="!isLast"
      role="separator"
      :aria-orientation="direction === 'horizontal' ? 'vertical' : 'horizontal'"
      :class="
        cn(
          'group relative z-10 shrink-0 bg-stone-200 transition-colors hover:bg-primary-400 dark:bg-surface-600 dark:hover:bg-primary-500',
          direction === 'horizontal' ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize',
        )
      "
      @mousedown="handleMouseDown"
    >
      <div
        :class="
          cn(
            'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-stone-400 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-stone-500',
            direction === 'horizontal' ? 'h-8 w-1' : 'h-1 w-8',
          )
        "
      />
    </div>
  </template>
</template>
