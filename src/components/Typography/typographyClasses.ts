import type { TypographyAlign, TypographyColor, TypographyWeight } from './typography.types';

export const variantClasses = {
  h1: 'text-4xl font-bold tracking-tight',
  h2: 'text-3xl font-semibold tracking-tight',
  h3: 'text-2xl font-semibold',
  h4: 'text-xl font-semibold',
  body: 'text-base font-normal',
  bodySm: 'text-sm font-normal',
  caption: 'text-xs font-normal',
  label: 'text-sm font-medium',
  overline: 'block text-xs font-semibold uppercase tracking-wider',
} as const;

export const colorClasses: Record<TypographyColor, string> = {
  default: 'text-stone-900 dark:text-stone-100',
  muted: 'text-stone-500 dark:text-stone-400',
  primary: 'text-primary-600 dark:text-primary-400',
  success: 'text-success-600 dark:text-success-400',
  danger: 'text-danger-600 dark:text-danger-400',
  warning: 'text-amber-600 dark:text-amber-400',
};

export const weightClasses: Record<TypographyWeight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

export const alignClasses: Record<TypographyAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};
