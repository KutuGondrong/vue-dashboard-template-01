import type { Component, Ref, VNode } from 'vue';

export interface NavMenuItem {
  key: string;
  label: string;
  icon?: VNode | Component;
  path?: string;
  /** When true, NavLink only matches the exact path (not nested routes). */
  end?: boolean;
  onClick?: () => void;
  children?: NavMenuItem[];
  /** Shows a yellow DEV badge next to the label (for dev-only sections like Storybook). */
  devBadge?: boolean;
  /**
   * `independent` — only this parent toggles; siblings stay as-is.
   * `all` — opening also expands every descendant level.
   */
  expandScope?: 'independent' | 'all';
  /** Seed fully expanded once when this branch is first opened; user collapse persists after. */
  defaultExpanded?: boolean;
  /** Close flyout after leaf/action child click when sidebar is collapsed. Overrides menu default. */
  flyoutDismissOnAction?: boolean;
  /**
   * When the item has `children`, controls the parent row click target.
   * `expand` — whole row toggles the subtree (default).
   * `navigate` — label/icon follow `path`; chevron toggles expand (requires `path`).
   */
  parentClick?: 'expand' | 'navigate';
}

export type NavMenuScrollControls = 'top' | 'bottom' | 'all' | 'none';

export type CollapseTriggerPosition = 'top' | 'bottom' | 'topPeeking' | 'centerPeeking';

export interface NavMenuProps {
  items: NavMenuItem[];
  /**
   * Icons-only sidebar mode. When `collapsible` without controlled `collapsed`, NavMenu manages
   * collapse state internally and this prop sets the initial value (updates when changed).
   * When `collapsed` is provided, parent controls this value (e.g. Layout.Sider sync).
   */
  collapsed?: boolean;
  /** Sidebar starts icons-only when true; expanded with labels when false. Toggle is internal when collapsible. */
  startCollapsed?: boolean;
  class?: string;
  /** Shows a button to collapse/expand the menu (icons-only mode). */
  collapsible?: boolean;
  /** Position of the collapse trigger button. */
  collapseTriggerPosition?: CollapseTriggerPosition;
  /** Default expanded (`always`) or collapsed (`collapsible`). Both modes can still be toggled. */
  childrenMode?: 'collapsible' | 'always';
  /** Connector lines between parent and child items. */
  childConnector?: 'none' | 'tree';
  /** Default expand scope for items without their own `expandScope`. */
  defaultExpandScope?: 'independent' | 'all';
  /** Close flyout after leaf/action child click in collapsed sidebar. Default true. */
  flyoutDismissOnAction?: boolean;
  /** Mount peeking collapse trigger on this host (e.g. sidebar column) to straddle nav + main content. */
  peekingHostRef?: Ref<HTMLElement | null> | HTMLElement | null;
  /** Pre-expanded branch keys (e.g. sidebar sections open by default). */
  initialOpenKeys?: string[];
  /** Overrides router pathname (e.g. isolated storybook preview). Pair with `navigateTo` or `@navigate`. */
  pathname?: string;
  /**
   * Handles path selection without vue-router navigation. Pair with `pathname`.
   * In Vue SFC templates prefer `@navigate`; in JSX use `onNavigate` (event, not a prop).
   */
  navigateTo?: (path: string) => void;
  /** When false (default), scrollbar is hidden but scrolling still works. */
  showScrollbar?: boolean;
  /**
   * Section scroll buttons when the menu overflows.
   * `top` — up only; `bottom` — down only; `all` — both (default); `none` — hidden.
   */
  scrollControls?: NavMenuScrollControls;
  /** Scroll button style — `bar` matches app sidebar; `pill` is the compact circular control. */
  scrollControlsVariant?: 'pill' | 'bar';
  /** Mobile drawer / embedded panel — defers horizontal padding to the parent container. */
  embedded?: boolean;
  /** When false, parent layout manages sidebar width (e.g. MainLayout aside). Default true. */
  manageWidth?: boolean;
  /** Aria/label wording for the collapse control (`sidebar` matches app chrome). */
  collapseLabelVariant?: 'menu' | 'sidebar';
}

export interface ItemContext {
  collapsed: boolean;
  depth: number;
  pathname: string;
  openKeys: Set<string>;
  onToggle: (key: string) => void;
  /** Open a branch without toggling closed (e.g. parent default-page navigate). */
  ensureOpen: (key: string) => void;
  flyoutKey: string | null;
  onFlyoutToggle: (key: string | null) => void;
  childConnector: 'none' | 'tree';
  inFlyout?: boolean;
  flyoutDismissOnAction: boolean;
  navigateTo?: (path: string) => void;
  /**
   * After a leaf/path activation: emits `navigate` (when path given) and `dismiss` when
   * NavMenu is `embedded` (e.g. mobile drawer).
   */
  onActivate?: (path?: string) => void;
}
