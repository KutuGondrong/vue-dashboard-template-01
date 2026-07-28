<script setup lang="ts">
import { onMounted, onUnmounted, provide, ref, watch } from 'vue';
import { cn } from './layoutUtils';
import {
  SplitterContextKey,
  type SplitterDirection,
  type SplitterPanelProps,
} from './layout.types';

const props = withDefaults(defineProps<{ direction?: SplitterDirection }>(), {
  direction: 'horizontal',
});

const emit = defineEmits<{ resize: [sizes: number[]] }>();

const panelPropsList = ref<SplitterPanelProps[]>([]);
const sizes = ref<number[]>([]);
const containerRef = ref<HTMLDivElement | null>(null);
const dragState = ref<{ index: number; startPos: number; startSizes: number[] } | null>(null);

function parsePanelSize(value: number | string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  if (typeof value === 'number') return value;
  const trimmed = value.trim();
  if (trimmed.endsWith('%')) return Number.parseFloat(trimmed);
  if (trimmed.endsWith('px')) return Number.parseFloat(trimmed);
  const parsed = Number.parseFloat(trimmed);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function registerPanel(panelProps: SplitterPanelProps): number {
  const index = panelPropsList.value.length;
  panelPropsList.value.push(panelProps);
  return index;
}

function recomputeSizes() {
  const count = panelPropsList.value.length;
  if (count === 0) {
    sizes.value = [];
    return;
  }
  const equal = 100 / count;
  sizes.value = panelPropsList.value.map((p) => parsePanelSize(p.defaultSize, equal));
}

watch(panelPropsList, recomputeSizes, { deep: true });

function notifyResize(nextSizes: number[]) {
  emit('resize', nextSizes);
}

function startDrag(index: number, startPos: number) {
  dragState.value = { index, startPos, startSizes: [...sizes.value] };
}

provide(SplitterContextKey, {
  direction: props.direction,
  registerPanel,
  sizes: () => sizes.value,
  startDrag,
  panelCount: () => panelPropsList.value.length,
});

function handleMove(event: MouseEvent) {
  if (!dragState.value || !containerRef.value) return;

  const { index, startPos, startSizes } = dragState.value;
  const rect = containerRef.value.getBoundingClientRect();
  const total = props.direction === 'horizontal' ? rect.width : rect.height;
  const currentPos = props.direction === 'horizontal' ? event.clientX : event.clientY;
  const deltaPercent = ((currentPos - startPos) / total) * 100;

  const leftIndex = index;
  const rightIndex = index + 1;
  if (rightIndex >= startSizes.length) return;

  const leftPanel = panelPropsList.value[leftIndex];
  const rightPanel = panelPropsList.value[rightIndex];

  let nextLeft = startSizes[leftIndex] + deltaPercent;
  let nextRight = startSizes[rightIndex] - deltaPercent;

  const leftMin = leftPanel?.min ?? 10;
  const leftMax = leftPanel?.max ?? 90;
  const rightMin = rightPanel?.min ?? 10;
  const rightMax = rightPanel?.max ?? 90;

  if (nextLeft < leftMin) {
    nextRight -= leftMin - nextLeft;
    nextLeft = leftMin;
  }
  if (nextRight < rightMin) {
    nextLeft -= rightMin - nextRight;
    nextRight = rightMin;
  }
  if (nextLeft > leftMax) {
    nextRight += nextLeft - leftMax;
    nextLeft = leftMax;
  }
  if (nextRight > rightMax) {
    nextLeft += nextRight - rightMax;
    nextRight = rightMax;
  }

  const next = [...sizes.value];
  next[leftIndex] = nextLeft;
  next[rightIndex] = nextRight;
  sizes.value = next;
  notifyResize(next);
}

onMounted(() => {
  window.addEventListener('mousemove', handleMove);
  window.addEventListener('mouseup', () => {
    dragState.value = null;
  });
});

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMove);
});
</script>

<template>
  <div
    ref="containerRef"
    :class="
      cn(
        'flex h-64 w-full overflow-hidden rounded-xl border border-stone-200 dark:border-surface-600',
        direction === 'vertical' ? 'flex-col' : 'flex-row',
      )
    "
  >
    <slot />
  </div>
</template>
