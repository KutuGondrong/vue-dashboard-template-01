import type { TableColumn } from '@/models/model.type';

export function getNestedValue(source: unknown, path: string): unknown {
  if (!path) return undefined;

  return path.split('.').reduce<unknown>((current, segment) => {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    return (current as Record<string, unknown>)[segment];
  }, source);
}

export function getTableColumnRawValue<T>(item: T, column: TableColumn<T>): unknown {
  const path = String(column.key);
  if (path.includes('.')) return getNestedValue(item, path);
  return item[path as keyof T];
}

export function resolveTableColumnCell<T>(item: T, column: TableColumn<T>): string {
  const raw = getTableColumnRawValue(item, column);
  if (raw === undefined || raw === null) return '';

  if (column.transform) {
    const transformed = column.transform(raw, item);
    if (transformed === undefined || transformed === null) return '';
    return String(transformed);
  }

  return String(raw);
}

export function compareTableValues(
  left: unknown,
  right: unknown,
  direction: 'asc' | 'desc',
): number {
  const factor = direction === 'asc' ? 1 : -1;

  if (left == null && right == null) return 0;
  if (left == null) return -1 * factor;
  if (right == null) return 1 * factor;

  if (typeof left === 'number' && typeof right === 'number') {
    return (left - right) * factor;
  }

  if (typeof left === 'boolean' && typeof right === 'boolean') {
    return (Number(left) - Number(right)) * factor;
  }

  if (left instanceof Date && right instanceof Date) {
    return (left.getTime() - right.getTime()) * factor;
  }

  return (
    String(left).localeCompare(String(right), undefined, {
      numeric: true,
      sensitivity: 'base',
    }) * factor
  );
}

export function sortTableRows<T>(
  rows: T[],
  column: TableColumn<T>,
  direction: 'asc' | 'desc',
): T[] {
  return [...rows].sort((a, b) =>
    compareTableValues(
      getTableColumnRawValue(a, column),
      getTableColumnRawValue(b, column),
      direction,
    ),
  );
}
