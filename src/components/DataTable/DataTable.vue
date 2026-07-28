<script setup lang="ts" generic="T extends { id: string }">
import { computed, ref, useAttrs, useSlots } from 'vue';
import { useLocale } from '@/locales/localeStore';
import type { TableColumn } from '@/models/model.type';
import { Pagination } from '@/components/Pagination';

import type { DataTableProps } from './dataTable.types';
import { resolveTableColumnCell, sortTableRows } from './tableColumnUtils';

type SortDirection = 'asc' | 'desc';

const props = withDefaults(defineProps<DataTableProps<T>>(), {
  isLoading: false,
  selectable: false,
  selectedIds: () => [],
  currentPage: 1,
  totalPages: 1,
  pageSize: 10,
  totalItems: 0,
  unwrapped: false,
  class: '',
});

const emit = defineEmits<{
  selectionChange: [ids: string[]];
  pageChange: [page: number];
  pageSizeChange: [size: number];
  sort: [key: string, direction: SortDirection];
}>();

const { t } = useLocale();
const attrs = useAttrs();
const slots = useSlots();
const showPagination = computed(() => Boolean(attrs.onPageChange));
const sortKey = ref<string | null>(null);
const sortDirection = ref<SortDirection>('asc');

const selectionMode = computed(
  () => props.rowSelection ?? (props.selectable ? 'checkbox' : undefined),
);
const hasRowSelection = computed(() => Boolean(selectionMode.value));

const hasActionsColumnKey = computed(() =>
  props.columns.some((column) => String(column.key) === 'actions'),
);
const hasActionsSlot = computed(() => Boolean(slots.actions));
/** Trailing #actions column only when slot is used without key: 'actions' in columns[]. */
const showTrailingActionsColumn = computed(
  () => hasActionsSlot.value && !hasActionsColumnKey.value,
);
const totalCols = computed(
  () =>
    props.columns.length +
    (hasRowSelection.value ? 1 : 0) +
    (showTrailingActionsColumn.value ? 1 : 0),
);
const isEmpty = computed(() => !props.isLoading && props.data.length === 0);
const pageSelectedCount = computed(
  () => props.data.filter((item) => props.selectedIds.includes(item.id)).length,
);

const hasSelectionActionsSlot = computed(() => Boolean(slots['selection-actions']));
const showSelectionBar = computed(() => hasRowSelection.value && props.selectedIds.length > 0);
const selectedItems = computed(() =>
  props.data.filter((item) => props.selectedIds.includes(item.id)),
);

const displayRows = computed(() => {
  if (!sortKey.value) return props.data;
  const column =
    props.columns.find((entry) => String(entry.key) === sortKey.value) ??
    ({ key: sortKey.value, header: '' } as TableColumn<T>);
  return sortTableRows(props.data, column, sortDirection.value);
});

function columnSlotName(column: TableColumn<T>): string {
  return String(column.key);
}

function usesActionsSlot(column: TableColumn<T>): boolean {
  return columnSlotName(column) === 'actions' && hasActionsSlot.value;
}

function hasColumnSlot(column: TableColumn<T>): boolean {
  return Boolean(slots[columnSlotName(column)]);
}

function handleSort(key: string) {
  const newDirection = sortKey.value === key && sortDirection.value === 'asc' ? 'desc' : 'asc';
  sortKey.value = key;
  sortDirection.value = newDirection;
  emit('sort', key, newDirection);
}

function handleSelectAll() {
  if (selectionMode.value !== 'checkbox') return;
  const pageIds = props.data.map((item) => item.id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => props.selectedIds.includes(id));
  if (allPageSelected) {
    emit(
      'selectionChange',
      props.selectedIds.filter((id) => !pageIds.includes(id)),
    );
  } else {
    emit('selectionChange', [...new Set([...props.selectedIds, ...pageIds])]);
  }
}

function handleSelectRow(id: string) {
  if (!selectionMode.value) return;
  if (selectionMode.value === 'radio') {
    emit('selectionChange', props.selectedIds.includes(id) ? [] : [id]);
    return;
  }
  if (props.selectedIds.includes(id)) {
    emit(
      'selectionChange',
      props.selectedIds.filter((sid) => sid !== id),
    );
  } else {
    emit('selectionChange', [...props.selectedIds, id]);
  }
}

function getCellValue(item: T, column: TableColumn<T>): string {
  return resolveTableColumnCell(item, column);
}

function setIndeterminate(el: HTMLInputElement | null, value: boolean) {
  if (el) el.indeterminate = value;
}
</script>

<template>
  <div
    :class="
      unwrapped
        ? props.class
        : [
          'overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-surface-600 dark:bg-surface-800',
          props.class,
        ]
    "
  >
    <div
      v-if="showSelectionBar"
      class="flex items-center justify-between gap-3 border-b border-stone-200 bg-primary-50 px-4 py-2 dark:border-surface-600 dark:bg-primary-950/30"
    >
      <span class="text-sm text-primary-700 dark:text-primary-300">
        {{ t('table.selected', { count: selectedIds.length }) }}
      </span>
      <div
        v-if="hasSelectionActionsSlot"
        class="flex shrink-0 items-center gap-2"
      >
        <slot
          name="selection-actions"
          :selected-ids="selectedIds"
          :selected-items="selectedItems"
        />
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead
          class="border-b border-stone-200 bg-stone-50 dark:border-surface-600 dark:bg-surface-900/70"
        >
          <tr>
            <th
              v-if="hasRowSelection"
              class="w-10 px-4 py-3"
            >
              <input
                v-if="selectionMode === 'checkbox'"
                :ref="
                  (el) =>
                    setIndeterminate(
                      el as HTMLInputElement,
                      !isEmpty && pageSelectedCount > 0 && pageSelectedCount < data.length,
                    )
                "
                type="checkbox"
                :checked="!isEmpty && pageSelectedCount === data.length"
                :disabled="isEmpty"
                :aria-label="t('components.common.selectAll')"
                class="h-4 w-4 rounded border-stone-300 text-primary-600 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
                @change="handleSelectAll"
              >
              <span
                v-else
                class="sr-only"
              >{{ t('table.selectRow') }}</span>
            </th>
            <th
              v-for="column in columns"
              :key="String(column.key)"
              :class="[
                'px-4 py-3 font-medium text-stone-600 dark:text-stone-400',
                column.class ?? '',
              ]"
            >
              <button
                v-if="column.sortable"
                type="button"
                class="inline-flex items-center gap-1 hover:text-stone-900 dark:hover:text-white"
                @click="handleSort(String(column.key))"
              >
                {{ column.header }}
                <span
                  v-if="sortKey === String(column.key)"
                  aria-hidden="true"
                >
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </button>
              <template v-else>
                {{ column.header }}
              </template>
            </th>
            <th
              v-if="showTrailingActionsColumn"
              class="px-4 py-3 font-medium text-stone-600 dark:text-stone-400"
            >
              {{ t('components.common.actions') }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone-200 dark:divide-stone-700">
          <template v-if="isLoading">
            <tr
              v-for="i in 5"
              :key="i"
            >
              <td
                v-for="c in totalCols"
                :key="c"
                class="px-4 py-3"
              >
                <div class="h-4 animate-pulse rounded bg-stone-200 dark:bg-surface-600" />
              </td>
            </tr>
          </template>
          <tr v-else-if="isEmpty">
            <td
              :colspan="totalCols"
              class="px-4 py-16"
            >
              <div class="flex flex-col items-center justify-center text-center">
                <svg
                  class="mb-4 h-12 w-12 text-stone-300 dark:text-stone-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <h3 class="text-lg font-medium text-stone-900 dark:text-white">
                  {{ empty?.label ?? t('table.emptyTitle') }}
                </h3>
                <p class="mt-1 text-sm text-stone-500 dark:text-stone-400">
                  {{ empty?.desc ?? t('table.emptyDescription') }}
                </p>
              </div>
            </td>
          </tr>
          <tr
            v-for="item in displayRows"
            v-else
            :key="item.id"
            class="transition-colors hover:bg-primary-50/70 dark:hover:bg-primary-950/25"
          >
            <td
              v-if="hasRowSelection"
              class="px-4 py-3"
            >
              <input
                :type="selectionMode === 'radio' ? 'radio' : 'checkbox'"
                :name="selectionMode === 'radio' ? 'datatable-row-selection' : undefined"
                :checked="selectedIds.includes(item.id)"
                :aria-label="t('table.selectRowItem', { id: item.id })"
                :class="
                  selectionMode === 'radio'
                    ? 'h-4 w-4 border-stone-300 text-primary-600 focus:ring-primary-500'
                    : 'h-4 w-4 rounded border-stone-300 text-primary-600 focus:ring-primary-500'
                "
                @change="handleSelectRow(item.id)"
              >
            </td>
            <td
              v-for="column in columns"
              :key="String(column.key)"
              :class="['px-4 py-3 text-stone-900 dark:text-stone-100', column.class ?? '']"
            >
              <div
                v-if="usesActionsSlot(column)"
                class="flex items-center gap-2"
              >
                <slot
                  name="actions"
                  :item="item"
                />
              </div>
              <slot
                v-else-if="hasColumnSlot(column)"
                :name="columnSlotName(column)"
                :item="item"
              />
              <template v-else>
                {{ getCellValue(item, column) }}
              </template>
            </td>
            <td
              v-if="showTrailingActionsColumn"
              class="px-4 py-3"
            >
              <div class="flex items-center gap-2">
                <slot
                  name="actions"
                  :item="item"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="!unwrapped && showPagination"
      class="border-t border-stone-200 px-4 py-3 dark:border-surface-600"
    >
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :page-size="pageSize"
        :total-items="totalItems"
        @page-change="(page: number) => emit('pageChange', page)"
        @page-size-change="(size: number) => emit('pageSizeChange', size)"
      />
    </div>
  </div>
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>
