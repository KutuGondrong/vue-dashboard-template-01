<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { cn } from '@/components/Layout/layoutUtils';
import { useLocale } from '@/locales/localeStore';

import type { CodeBlockProps } from './codeBlock.types';

const props = withDefaults(defineProps<CodeBlockProps>(), {
  variant: 'inline',
  defaultExpanded: false,
  title: '',
  defaultOpen: false,
  compact: false,
  class: '',
});

const { t } = useLocale();

function getCodeLines(code: string): string[] {
  const lines = code.split('\n');
  while (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }
  return lines;
}

const copied = ref(false);
const expanded = ref(props.defaultExpanded);
const isOpen = ref(props.defaultOpen);
const preRef = ref<HTMLPreElement | null>(null);

const lines = () => getCodeLines(props.code);
const isCollapsible = () => props.previewLines != null && lines().length > props.previewLines!;
const fullCode = () => lines().join('\n');
const collapsedPreStyle = () => {
  if (!isCollapsible() || expanded.value || props.previewLines == null) return undefined;
  // text-xs (0.75rem) × leading-normal (1.5) = 1.125rem per line; py-2 = 1rem vertical padding
  return { maxHeight: `calc(1rem + ${props.previewLines} * 1.125rem)` };
};
const toggleLabel = () =>
  expanded.value
    ? t('components.common.codeBlockCollapse')
    : t('components.common.codeBlockExpand');

async function handleCopy() {
  await navigator.clipboard.writeText(props.code);
  copied.value = true;
  window.setTimeout(() => {
    copied.value = false;
  }, 2000);
}

function resizePre() {
  const el = preRef.value;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}

let resizeObserver: ResizeObserver | undefined;

watch(
  () => [props.code, isOpen.value] as const,
  async () => {
    if (props.variant !== 'accordion' || !isOpen.value) return;
    await nextTick();
    resizePre();
  },
  { flush: 'post' },
);

onMounted(() => {
  if (props.variant === 'accordion' && isOpen.value) {
    resizePre();
    const el = preRef.value;
    if (el?.parentElement) {
      resizeObserver = new ResizeObserver(() => resizePre());
      resizeObserver.observe(el.parentElement);
    }
  }
});

onUnmounted(() => {
  resizeObserver?.disconnect();
});
</script>

<template>
  <div
    v-if="variant === 'accordion'"
    :class="
      cn('w-full min-w-0 rounded-lg border border-stone-200 dark:border-surface-600', props.class)
    "
  >
    <button
      type="button"
      :class="
        cn(
          'flex w-full items-center justify-between text-left text-sm font-medium text-stone-700 dark:text-stone-300',
          compact ? 'px-3 py-2' : 'px-4 py-3',
        )
      "
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      <span>{{ title }}</span>
      <svg
        :class="cn('h-4 w-4 shrink-0 transition-transform duration-200', isOpen && 'rotate-180')"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <div
      v-if="isOpen"
      class="border-t border-stone-200 dark:border-surface-600"
    >
      <div
        :class="cn('flex items-center justify-between gap-3', compact ? 'px-3 pt-2' : 'px-4 pt-3')"
      >
        <p
          v-if="hint"
          class="text-xs text-stone-500 dark:text-stone-400"
        >
          {{ hint }}
        </p>
        <span v-else />
        <button
          type="button"
          :class="
            cn(
              'shrink-0 rounded-md bg-stone-700 px-2.5 py-1 text-xs font-medium text-stone-300 transition-colors hover:bg-stone-600 hover:text-white',
            )
          "
          @click="handleCopy"
        >
          {{ copied ? t('components.common.copied') : t('components.common.copy') }}
        </button>
      </div>
      <div :class="compact ? 'px-3 pb-2' : 'px-4 pb-2'">
        <pre
          ref="preRef"
          class="w-full min-w-0 overflow-hidden rounded-lg bg-stone-900 px-3 py-2 font-mono text-xs leading-normal text-success-400"
          v-text="fullCode()"
        />
      </div>
    </div>
  </div>

  <div
    v-else
    :class="
      cn(
        'w-full min-w-0 overflow-hidden rounded-lg border border-stone-200 bg-stone-950 dark:border-surface-600',
        props.class,
      )
    "
  >
    <div class="flex items-center gap-2 border-b border-stone-800/80 px-2 py-1">
      <button
        v-if="isCollapsible()"
        type="button"
        :aria-expanded="expanded"
        :aria-label="toggleLabel()"
        :title="toggleLabel()"
        class="flex shrink-0 items-center rounded-md bg-stone-800 px-1.5 py-0.5 text-xs font-medium text-stone-300 transition-colors hover:bg-stone-700 hover:text-white"
        @click="expanded = !expanded"
      >
        <svg
          :class="
            cn('h-3.5 w-3.5 shrink-0 transition-transform duration-200', expanded && 'rotate-180')
          "
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <span class="min-w-0 flex-1" />
      <button
        type="button"
        class="shrink-0 rounded-md bg-stone-800 px-2 py-0.5 text-xs font-medium text-stone-300 transition-colors hover:bg-stone-700 hover:text-white"
        @click="handleCopy"
      >
        {{ copied ? t('components.common.copied') : t('components.common.copy') }}
      </button>
    </div>
    <div class="w-full min-w-0 overflow-hidden">
      <pre
        :style="collapsedPreStyle()"
        :class="
          cn(
            'w-full min-w-0 overflow-x-auto px-3 py-2 font-mono text-xs leading-normal text-stone-100 [scrollbar-gutter:stable]',
            isCollapsible() && !expanded && 'overflow-y-hidden',
          )
        "
        v-text="fullCode()"
      />
    </div>
  </div>
</template>
