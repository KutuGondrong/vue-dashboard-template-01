/**
 * App chrome surfaces.
 *
 * Light: white header → stone-100 nav → stone-50 body → stone-200 footer
 * Dark:  surface-950 canvas → surface-900 header/nav → surface-800 footer/panels
 */
export const layoutSurfaces = {
  canvas: 'bg-stone-50 dark:bg-surface-950',
  header: 'bg-white dark:bg-surface-900',
  nav: 'bg-stone-100 dark:bg-surface-900',
  main: 'bg-stone-50 dark:bg-surface-950',
  footer: 'bg-stone-200 dark:bg-surface-800',
} as const;
