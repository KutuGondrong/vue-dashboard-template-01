import type { NavMenuItem } from './navMenu.types';

export const rowBase = 'flex w-full items-center rounded-lg text-sm font-medium transition-colors';
export const rowDefault =
  'text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-surface-700';
export const rowActive =
  'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300';
export const childDefault =
  'text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-surface-700 dark:hover:text-stone-200';
export const childActive =
  'bg-primary-50 font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300';

export const TREE_BRANCH_W = 12;
export const TREE_BRANCH_PEEK = 4;
export const TREE_DIRECT_CHILD_ROW_SELECTOR = ':scope > ul > li > div > [data-nav-tree-row]';

export function treeChildrenMargin() {
  return 'ml-3';
}

export function rowPadding(depth: number, collapsed: boolean) {
  if (collapsed) return 'justify-center px-2 py-2.5';
  if (depth > 0) return 'gap-2 px-3 py-1.5';
  return 'gap-3 px-3 py-2';
}

export function isNavPathActive(path: string, pathname: string, end?: boolean): boolean {
  if (end) return pathname === path;
  return pathname === path || (path !== '/' && pathname.startsWith(`${path}/`));
}

export function collectPaths(items: NavMenuItem[]): string[] {
  const paths: string[] = [];
  for (const item of items) {
    if (item.path) paths.push(item.path);
    if (item.children) paths.push(...collectPaths(item.children));
  }
  return paths;
}

export function findOpenKeysForPath(items: NavMenuItem[], pathname: string): string[] {
  const keys: string[] = [];

  for (const item of items) {
    if (!item.children?.length) continue;

    const childPaths = collectPaths(item.children);
    const isActive =
      childPaths.some((path) => pathname.startsWith(path)) ||
      (item.path && pathname.startsWith(item.path));

    if (isActive) keys.push(item.key);
    keys.push(...findOpenKeysForPath(item.children, pathname));
  }

  return keys;
}

export function isItemActive(item: NavMenuItem, pathname: string): boolean {
  if (item.path && isNavPathActive(item.path, pathname, item.end)) return true;
  if (item.children) return item.children.some((child) => isItemActive(child, pathname));
  return false;
}

export function findItemByKey(items: NavMenuItem[], key: string): NavMenuItem | null {
  for (const item of items) {
    if (item.key === key) return item;
    if (item.children) {
      const found = findItemByKey(item.children, key);
      if (found) return found;
    }
  }
  return null;
}

export function collectDescendantKeysWithChildren(items: NavMenuItem[]): string[] {
  const keys: string[] = [];
  for (const item of items) {
    if (!item.children?.length) continue;
    keys.push(item.key);
    keys.push(...collectDescendantKeysWithChildren(item.children));
  }
  return keys;
}

export function getExpandScope(
  item: NavMenuItem | null | undefined,
  defaultExpandScope: 'independent' | 'all',
): 'independent' | 'all' {
  return item?.expandScope ?? defaultExpandScope;
}

export function seedDefaultExpandedSubtree(
  item: NavMenuItem,
  openKeys: Set<string>,
  seededKeys: Set<string>,
) {
  if (!item.defaultExpanded || !item.children?.length || seededKeys.has(item.key)) return;
  seededKeys.add(item.key);
  openKeys.add(item.key);
  for (const key of collectDescendantKeysWithChildren(item.children)) {
    openKeys.add(key);
  }
}

export function applyDefaultExpandedKeysOnce(
  items: NavMenuItem[],
  pathname: string,
  openKeys: Set<string>,
  seededKeys: Set<string>,
) {
  for (const item of items) {
    if (item.defaultExpanded && item.children?.length && isItemActive(item, pathname)) {
      seedDefaultExpandedSubtree(item, openKeys, seededKeys);
    }
    if (item.children?.length) {
      applyDefaultExpandedKeysOnce(item.children, pathname, openKeys, seededKeys);
    }
  }
}

export function getFlyoutDismissOnAction(item: NavMenuItem, menuDefault: boolean): boolean {
  return item.flyoutDismissOnAction ?? menuDefault;
}

export function isNavigateParent(item: NavMenuItem): boolean {
  return (
    Boolean(item.children?.length) &&
    (item.parentClick ?? 'expand') === 'navigate' &&
    Boolean(item.path)
  );
}

export function getDirectChildRows(wrapper: HTMLElement): HTMLElement[] {
  return [...wrapper.querySelectorAll<HTMLElement>(TREE_DIRECT_CHILD_ROW_SELECTOR)];
}

export function isPeekingCollapseTrigger(position: string): boolean {
  return position === 'topPeeking' || position === 'centerPeeking';
}

export function getInitialOpenKeys(
  items: NavMenuItem[],
  pathname: string,
  childrenMode: 'collapsible' | 'always',
): Set<string> {
  if (childrenMode === 'always') {
    return new Set(collectDescendantKeysWithChildren(items));
  }
  return new Set(findOpenKeysForPath(items, pathname));
}

export function openKeysEqual(a: Iterable<string>, b: Iterable<string>): boolean {
  const setA = a instanceof Set ? a : new Set(a);
  const setB = b instanceof Set ? b : new Set(b);
  if (setA.size !== setB.size) return false;
  for (const key of setA) {
    if (!setB.has(key)) return false;
  }
  return true;
}

export function toOpenKeysArray(keys: Set<string>): string[] {
  return [...keys];
}

export function mergeOpenKeysForPath(
  current: string[],
  items: NavMenuItem[],
  pathname: string,
  seededKeys: Set<string>,
  userCollapsedKeys: Set<string>,
): string[] | null {
  const next = new Set(current);
  for (const key of findOpenKeysForPath(items, pathname)) {
    if (!userCollapsedKeys.has(key)) {
      next.add(key);
    }
  }
  applyDefaultExpandedKeysOnce(items, pathname, next, seededKeys);
  return openKeysEqual(next, current) ? null : toOpenKeysArray(next);
}

export function resolveOpenKeysFromProps(
  items: NavMenuItem[],
  pathname: string,
  childrenMode: 'collapsible' | 'always',
  initialOpenKeys: string[],
  seededKeys: Set<string>,
): string[] {
  if (childrenMode === 'always') {
    return toOpenKeysArray(collectDescendantKeysWithChildren(items));
  }

  const base = new Set([...getInitialOpenKeys(items, pathname, childrenMode), ...initialOpenKeys]);
  applyDefaultExpandedKeysOnce(items, pathname, base, seededKeys);
  return toOpenKeysArray(base);
}
