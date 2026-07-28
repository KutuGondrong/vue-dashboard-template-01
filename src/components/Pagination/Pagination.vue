<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useLocale } from '@/locales/localeStore';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
}

const props = withDefaults(defineProps<PaginationProps>(), {
  pageSizeOptions: () => [5, 10, 20, 50],
});

const emit = defineEmits<{
  pageChange: [page: number];
  pageSizeChange: [size: number];
}>();

const instance = getCurrentInstance();
const { t } = useLocale();

const MENU_ITEM_HEIGHT = 36;
const MENU_PADDING = 8;
const MENU_GAP = 4;

const pageSizeOpen = ref(false);
const openUpward = ref(false);
const pageSizeTriggerRef = ref<HTMLButtonElement | null>(null);
const pageSizeListRef = ref<HTMLUListElement | null>(null);
const pageSizePosition = ref<{
  top: string;
  bottom: string;
  left: string;
  minWidth: string;
} | null>(null);
const pageSizeThemeClass = ref('');

const showPageSize = computed(() => {
  if (typeof props.onPageSizeChange === 'function') return true;
  return typeof instance?.vnode.props?.onPageSizeChange === 'function';
});

const pageNumbers = computed((): (number | 'ellipsis')[] => {
  const pages: (number | 'ellipsis')[] = [];
  const maxVisible = 5;

  if (props.totalPages <= maxVisible) {
    for (let i = 1; i <= props.totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (props.currentPage > 3) pages.push('ellipsis');
    for (
      let i = Math.max(2, props.currentPage - 1);
      i <= Math.min(props.totalPages - 1, props.currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (props.currentPage < props.totalPages - 2) pages.push('ellipsis');
    pages.push(props.totalPages);
  }

  return pages;
});

function updatePageSizePosition() {
  const anchor = pageSizeTriggerRef.value;
  if (!anchor || !pageSizeOpen.value) {
    pageSizePosition.value = null;
    return;
  }

  const rect = anchor.getBoundingClientRect();
  const menuHeight = props.pageSizeOptions.length * MENU_ITEM_HEIGHT + MENU_PADDING;
  const spaceBelow = window.innerHeight - rect.bottom;
  const shouldOpenUp = spaceBelow < menuHeight && rect.top > menuHeight;

  openUpward.value = shouldOpenUp;
  pageSizePosition.value = shouldOpenUp
    ? {
        top: 'auto',
        bottom: `${window.innerHeight - rect.top + MENU_GAP}px`,
        left: `${rect.left}px`,
        minWidth: `${rect.width}px`,
      }
    : {
        top: `${rect.bottom + MENU_GAP}px`,
        bottom: 'auto',
        left: `${rect.left}px`,
        minWidth: `${rect.width}px`,
      };

  pageSizeThemeClass.value = anchor.closest('.dark') ? 'dark' : '';
}

function openPageSize() {
  pageSizeOpen.value = true;
  updatePageSizePosition();
  void nextTick(updatePageSizePosition);
}

function closePageSize() {
  pageSizeOpen.value = false;
  pageSizePosition.value = null;
}

function togglePageSize() {
  if (pageSizeOpen.value) {
    closePageSize();
    return;
  }
  openPageSize();
}

function handlePageSizeChange(size: number) {
  emit('pageSizeChange', size);
  closePageSize();
}

watch(pageSizeOpen, (open) => {
  if (open) void nextTick(updatePageSizePosition);
});

let removePageSizeListeners: (() => void) | undefined;
onMounted(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node;
    const inTrigger = pageSizeTriggerRef.value?.contains(target);
    const inList = pageSizeListRef.value?.contains(target);
    if (!inTrigger && !inList) closePageSize();
  };
  const handleReposition = () => {
    if (pageSizeOpen.value) updatePageSizePosition();
  };
  document.addEventListener('mousedown', handleClickOutside);
  window.addEventListener('scroll', handleReposition, true);
  window.addEventListener('resize', handleReposition);
  removePageSizeListeners = () => {
    document.removeEventListener('mousedown', handleClickOutside);
    window.removeEventListener('scroll', handleReposition, true);
    window.removeEventListener('resize', handleReposition);
  };
});
onUnmounted(() => {
  removePageSizeListeners?.();
});
</script>

<template>
  <div
    v-if="totalPages > 0"
    class="w-full min-w-0 overflow-x-auto"
  >
    <div class="flex w-max min-w-full flex-col items-center justify-between gap-4 sm:flex-row">
      <div
        class="flex shrink-0 flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-stone-600 sm:justify-start dark:text-stone-400"
      >
        <div
          v-if="showPageSize"
          class="flex items-center gap-2"
        >
          <span class="hidden sm:inline">{{ t('table.rowsPerPage') }}</span>
          <span class="sm:hidden">{{ t('table.rowsPerPageShort') }}</span>
          <button
            ref="pageSizeTriggerRef"
            type="button"
            role="combobox"
            class="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2 py-1 text-sm text-stone-900 transition-colors hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-surface-500 dark:bg-surface-800 dark:text-stone-100 dark:hover:bg-surface-700"
            :aria-expanded="pageSizeOpen"
            aria-haspopup="listbox"
            :aria-label="t('table.pageSize')"
            @click="togglePageSize"
          >
            <span>{{ pageSize }}</span>
            <svg
              class="h-3.5 w-3.5 shrink-0 text-stone-400 transition-transform"
              :class="pageSizeOpen ? 'rotate-180' : ''"
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
          <Teleport to="body">
            <ul
              v-if="pageSizeOpen && pageSizePosition"
              ref="pageSizeListRef"
              role="listbox"
              :aria-label="t('table.pageSize')"
              :class="[
                'fixed z-50 overflow-auto rounded-lg border border-stone-200 bg-white py-1 shadow-lg [overflow-anchor:none] dark:border-surface-600 dark:bg-surface-800',
                openUpward ? 'origin-bottom' : 'origin-top',
                pageSizeThemeClass,
              ]"
              :style="{
                top: pageSizePosition.top,
                bottom: pageSizePosition.bottom,
                left: pageSizePosition.left,
                minWidth: pageSizePosition.minWidth,
              }"
            >
              <li
                v-for="size in pageSizeOptions"
                :key="size"
                role="option"
                :aria-selected="size === pageSize"
                class="cursor-pointer px-3 py-1.5 text-sm transition-colors"
                :class="
                  size === pageSize
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-stone-700 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-surface-600'
                "
                @click="handlePageSizeChange(size)"
              >
                {{ size }}
              </li>
            </ul>
          </Teleport>
        </div>
        <span class="whitespace-nowrap">
          <span class="hidden sm:inline">
            {{ t('table.pageOf', { current: currentPage, total: totalPages }) }}
            ({{ t('table.itemCount', { count: totalItems }) }})
          </span>
          <span class="sm:hidden">
            {{ t('table.pageOfShort', { current: currentPage, total: totalPages }) }} ·
            {{ t('table.itemCountShort', { count: totalItems }) }}
          </span>
        </span>
      </div>

      <nav
        :aria-label="t('components.common.pagination')"
        class="flex shrink-0 flex-nowrap items-center gap-1"
      >
        <button
          type="button"
          :disabled="currentPage <= 1"
          :aria-label="t('components.common.previous')"
          class="rounded-lg px-2 py-1.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 dark:text-stone-300 dark:hover:bg-surface-600"
          @click="emit('pageChange', currentPage - 1)"
        >
          <span class="hidden sm:inline">{{ t('components.common.previous') }}</span>
          <svg
            class="h-4 w-4 sm:hidden"
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

        <template
          v-for="(page, index) in pageNumbers"
          :key="page === 'ellipsis' ? `ellipsis-${index}` : page"
        >
          <span
            v-if="page === 'ellipsis'"
            class="px-1 text-stone-400 sm:px-2"
          >...</span>
          <button
            v-else
            type="button"
            :aria-current="page === currentPage ? 'page' : undefined"
            :class="`rounded-lg px-2 py-1.5 text-sm font-medium transition-colors sm:px-3 ${
              page === currentPage
                ? 'bg-primary-600 text-white dark:bg-primary-500'
                : 'text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-surface-600'
            }`"
            @click="emit('pageChange', page)"
          >
            {{ page }}
          </button>
        </template>

        <button
          type="button"
          :disabled="currentPage >= totalPages"
          :aria-label="t('components.common.next')"
          class="rounded-lg px-2 py-1.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 dark:text-stone-300 dark:hover:bg-surface-600"
          @click="emit('pageChange', currentPage + 1)"
        >
          <span class="hidden sm:inline">{{ t('components.common.next') }}</span>
          <svg
            class="h-4 w-4 sm:hidden"
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
      </nav>
    </div>
  </div>
</template>
