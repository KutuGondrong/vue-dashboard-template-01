import type { TableColumn } from '@/models/model.type';

export type RowSelectionMode = 'checkbox' | 'radio';

export interface DataTableEmptyState {
  label?: string;
  desc?: string;
}

export interface DataTableProps<TItem extends { id: string }> {
  data: TItem[];
  columns: TableColumn<TItem>[];
  isLoading?: boolean;
  selectable?: boolean;
  rowSelection?: RowSelectionMode;
  selectedIds?: string[];
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  totalItems?: number;
  empty?: DataTableEmptyState;
  unwrapped?: boolean;
  class?: string;
}
