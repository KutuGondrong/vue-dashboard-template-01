<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { resolveChartColor } from '@/config/color.tokens';
import { useLocale } from '@/locales/localeStore';
import { DonutChartSkeleton } from '@/components/SkeletonLoader';
import { formatChartValue } from './chartUtils';
import type { DonutChartProps } from './chart.types';
import { useChartAnimationKey } from './useChartAnimationKey';

type ResolvedLegend = 'center' | 'right' | 'bottom';

const props = withDefaults(defineProps<DonutChartProps>(), {
  size: 0,
  class: '',
  animated: true,
  legendPosition: 'auto',
  isLoading: false,
});

const { t } = useLocale();
const animationKey = useChartAnimationKey(
  () => props.animated,
  () => props.size ?? 0,
);

const VIEWBOX = 200;
const STROKE_WIDTH = 28;
const RING_INSET = 3;
const LEGEND_MIN_WIDTH = 152;
const LEGEND_GAP = 16;
const LEGEND_BOTTOM_EST = 88;
const CENTER_MIN = 280;
const RING_MIN = 96;
const SIDE_RING_FLOOR = 160;
const BOX_EPSILON = 16;
const RING_FIT_PAD = 20;
const radius = (VIEWBOX - STROKE_WIDTH) / 2 - RING_INSET;
const circumference = 2 * Math.PI * radius;
const center = VIEWBOX / 2;
const animatedOffset = ref(props.animated ? circumference : 0);

const rootRef = ref<HTMLElement | null>(null);
const resolvedLegend = ref<ResolvedLegend>(
  props.legendPosition === 'auto' ? 'right' : props.legendPosition,
);
const ringPx = ref(SIDE_RING_FLOOR);

let resizeObserver: ResizeObserver | undefined;
let lastW = 0;
let lastH = 0;
let debounceTimer = 0;

function minSizeOrNull(): number | null {
  const value = props.size;
  if (value == null || value <= 0) return null;
  return value;
}

function hasDefiniteHeight(el: HTMLElement): boolean {
  let node: HTMLElement | null = el;
  for (let i = 0; i < 8 && node && node !== document.body; i++) {
    const style = getComputedStyle(node);
    if (Number.parseFloat(style.flexGrow) > 0) return true;
    const { height } = style;
    if (height && height !== 'auto' && !height.endsWith('%') && Number.parseFloat(height) > 0) {
      return true;
    }
    node = node.parentElement;
  }
  return false;
}

function contentBox(el: HTMLElement): { width: number; height: number } {
  const style = getComputedStyle(el);
  const width =
    el.clientWidth - Number.parseFloat(style.paddingLeft) - Number.parseFloat(style.paddingRight);
  const height =
    el.clientHeight - Number.parseFloat(style.paddingTop) - Number.parseFloat(style.paddingBottom);
  return { width: Math.max(0, width), height: Math.max(0, height) };
}

function pickLegend(width: number, height: number, heightGiven: boolean): ResolvedLegend {
  if (props.legendPosition !== 'auto') return props.legendPosition;

  const minSize = minSizeOrNull();
  const minSideRing =
    minSize != null
      ? Math.min(minSize, Math.max(RING_MIN, Math.round(minSize * 0.85)))
      : SIDE_RING_FLOOR;
  const canRight = width >= minSideRing + LEGEND_GAP + LEGEND_MIN_WIDTH;

  if (heightGiven) {
    const square = Math.min(width, height);
    if (square >= CENTER_MIN) return 'center';
    if (canRight) return 'right';
    return 'bottom';
  }

  if (canRight) return 'right';
  return 'bottom';
}

function sizeRing(width: number, height: number, heightGiven: boolean, legend: ResolvedLegend) {
  const minSize = minSizeOrNull();
  const dynamic = minSize == null;

  const fit = (max: number, fill: boolean) => {
    const available = Math.max(0, Math.floor(max));
    if (available <= 0) return dynamic ? RING_MIN : minSize!;
    if (dynamic) return Math.max(RING_MIN, available);
    const floor = Math.min(minSize!, available);
    return fill ? Math.max(floor, available) : floor;
  };

  if (legend === 'center') {
    return fit(Math.min(width, height) - RING_FIT_PAD, true);
  }

  if (legend === 'right') {
    const byWidth = width - LEGEND_MIN_WIDTH - LEGEND_GAP;
    if (heightGiven || dynamic) {
      return fit(Math.min(byWidth, heightGiven ? height - RING_FIT_PAD : byWidth), true);
    }
    return fit(byWidth, false);
  }

  if (heightGiven || dynamic) {
    return fit(heightGiven ? Math.min(width, height - LEGEND_BOTTOM_EST) : width, true);
  }
  return fit(width, false);
}

function applyLayout() {
  const root = rootRef.value;
  if (!root) return;

  const parent = root.parentElement ?? root;
  const { width, height } = contentBox(parent);
  if (width <= 0) return;

  if (Math.abs(width - lastW) < BOX_EPSILON && Math.abs(height - lastH) < BOX_EPSILON) {
    return;
  }
  lastW = width;
  lastH = height;

  const heightGiven = hasDefiniteHeight(root);
  const usableHeight = heightGiven ? height : 0;
  const next = pickLegend(width, usableHeight, heightGiven);
  resolvedLegend.value = next;
  ringPx.value = sizeRing(
    width,
    heightGiven ? height : Math.max(height, SIDE_RING_FLOOR),
    heightGiven,
    next,
  );
}

function scheduleLayout() {
  window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => {
    lastW = 0;
    lastH = 0;
    applyLayout();
  }, 80);
}

const segmentData = computed(() =>
  props.segments.map((segment) => ({
    ...segment,
    color: resolveChartColor(segment.colorToken),
    percentage: props.total > 0 ? (segment.value / props.total) * 100 : 0,
    dashLength: props.total > 0 ? (segment.value / props.total) * circumference : 0,
  })),
);

const dashOffsets = computed(() => {
  const offsets: number[] = [];
  let cumulative = 0;
  for (const segment of segmentData.value) {
    offsets.push(cumulative);
    cumulative += segment.dashLength;
  }
  return offsets;
});

const rootClass = computed(() => {
  const base = 'flex h-full max-h-full w-full min-w-0 max-w-full overflow-hidden';
  if (resolvedLegend.value === 'right') return `${base} flex-row items-center justify-center gap-4`;
  if (resolvedLegend.value === 'bottom') return `${base} flex-col items-center gap-4`;
  return `${base} items-center justify-center`;
});

function playIntro() {
  if (!props.animated) {
    animatedOffset.value = 0;
    return;
  }
  animatedOffset.value = circumference;
  requestAnimationFrame(() => {
    window.setTimeout(() => {
      animatedOffset.value = 0;
    }, 50);
  });
}

onMounted(() => {
  applyLayout();
  playIntro();

  const root = rootRef.value;
  const target = root?.parentElement ?? root;
  if (!target || typeof ResizeObserver === 'undefined') return;
  resizeObserver = new ResizeObserver(() => scheduleLayout());
  resizeObserver.observe(target);
});

onBeforeUnmount(() => {
  window.clearTimeout(debounceTimer);
  resizeObserver?.disconnect();
});

watch(
  () => [props.size, props.legendPosition, props.segments.length] as const,
  () => scheduleLayout(),
);

watch([() => props.animated, animationKey, () => props.total], () => {
  playIntro();
});
</script>

<template>
  <DonutChartSkeleton
    v-if="isLoading"
    :class="props.class"
    :count="segments.length"
    :size="minSizeOrNull() ?? 0"
  />
  <div
    v-else-if="segments.length === 0"
    :class="`flex items-center justify-center text-sm text-stone-400 dark:text-stone-500 ${props.class}`"
    :style="{
      width: minSizeOrNull() ?? SIDE_RING_FLOOR,
      height: minSizeOrNull() ?? SIDE_RING_FLOOR,
    }"
  >
    {{ t('components.common.noData') }}
  </div>
  <div
    v-else
    ref="rootRef"
    :class="[rootClass, props.class]"
  >
    <div
      class="relative max-h-full max-w-full shrink-0"
      :style="{ width: `${ringPx}px`, height: `${ringPx}px` }"
    >
      <svg
        class="h-full w-full overflow-visible"
        :viewBox="`0 0 ${VIEWBOX} ${VIEWBOX}`"
        role="img"
        :aria-label="t('components.common.donutChart')"
      >
        <circle
          :cx="center"
          :cy="center"
          :r="radius"
          fill="none"
          class="stroke-stone-100 dark:stroke-surface-700"
          :stroke-width="STROKE_WIDTH"
        />
        <circle
          v-for="(segment, index) in segmentData"
          :key="segment.labelKey"
          :cx="center"
          :cy="center"
          :r="radius"
          fill="none"
          :stroke="segment.color"
          :stroke-width="STROKE_WIDTH"
          stroke-linecap="butt"
          :stroke-dasharray="`${segment.dashLength} ${circumference - segment.dashLength}`"
          :stroke-dashoffset="-dashOffsets[index] + (animated ? animatedOffset : 0)"
          :transform="`rotate(-90 ${center} ${center})`"
          :style="{
            transition: animated ? `stroke-dashoffset 1s ease-out ${index * 0.1}s` : undefined,
          }"
        >
          <title>
            {{
              `${segment.label}: ${formatChartValue(segment.value)} (${segment.percentage.toFixed(1)}%)`
            }}
          </title>
        </circle>
      </svg>

      <div
        class="absolute inset-0 flex flex-col items-center justify-center overflow-hidden px-3 text-center"
      >
        <span
          class="font-bold tabular-nums leading-none text-stone-900 dark:text-white"
          :style="{ fontSize: `clamp(1.125rem, ${ringPx * 0.12}px, 1.75rem)` }"
        >
          {{ formatChartValue(total) }}
        </span>
        <span
          v-if="centerLabel"
          class="mt-0.5 max-w-full truncate text-xs text-stone-500 dark:text-stone-400"
        >{{ centerLabel }}</span>

        <ul
          v-if="resolvedLegend === 'center'"
          class="mt-2 max-w-full space-y-1 overflow-hidden"
        >
          <li
            v-for="segment in segmentData"
            :key="`center-${segment.labelKey}`"
            class="flex items-center justify-center gap-1.5 text-left text-[0.6875rem] leading-none"
          >
            <span
              class="h-1.5 w-1.5 shrink-0 rounded-full"
              :style="{ backgroundColor: segment.color }"
              aria-hidden="true"
            />
            <span class="whitespace-nowrap text-stone-600 dark:text-stone-300">{{
              segment.label
            }}</span>
            <span class="whitespace-nowrap font-medium tabular-nums text-stone-900 dark:text-white">
              {{ segment.percentage.toFixed(0) }}%
            </span>
          </li>
        </ul>
      </div>
    </div>

    <ul
      v-if="resolvedLegend === 'right' || resolvedLegend === 'bottom'"
      class="min-w-0 space-y-2 overflow-hidden"
      :class="
        resolvedLegend === 'bottom' ? 'w-full max-w-full shrink-0 self-stretch' : 'w-auto shrink-0'
      "
    >
      <li
        v-for="segment in segmentData"
        :key="`external-${segment.labelKey}`"
        class="flex min-w-0 items-center gap-2 text-sm leading-none"
      >
        <span
          class="h-3 w-3 shrink-0 rounded-full"
          :style="{ backgroundColor: segment.color }"
          aria-hidden="true"
        />
        <span class="min-w-0 shrink whitespace-nowrap text-stone-600 dark:text-stone-300">{{
          segment.label
        }}</span>
        <span
          class="shrink-0 whitespace-nowrap font-medium tabular-nums text-stone-900 dark:text-white"
          :class="resolvedLegend === 'bottom' ? 'ml-auto' : undefined"
        >
          {{ segment.percentage.toFixed(0) }}%
        </span>
      </li>
    </ul>
  </div>
</template>
