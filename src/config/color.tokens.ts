/** Design color tokens — keep in sync with tailwind.config.js `theme.extend.colors` */
export const colorTokens = {
  primary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22',
  },
  accent: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
    950: '#042f2e',
  },
  surface: {
    light: '#ffffff',
    dark: '#070b09',
    950: '#070b09',
    900: '#0c1210',
    800: '#131b17',
    700: '#1a2420',
    600: '#24302b',
    500: '#3a4741',
    400: '#55635c',
  },
  success: {
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
  },
  danger: {
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
  },
  info: {
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
  },
} as const;

/** Semantic token keys for chart SVG fills/strokes */
export type ChartColorToken =
  | 'primary'
  | 'primary-light'
  | 'accent'
  | 'success'
  | 'danger'
  | 'info';

export const chartColorTokens: Record<ChartColorToken, string> = {
  primary: colorTokens.primary[500],
  'primary-light': colorTokens.primary[400],
  accent: colorTokens.accent[500],
  success: colorTokens.success[500],
  danger: colorTokens.danger[500],
  info: colorTokens.info[500],
};

export const DEFAULT_CHART_COLOR_TOKEN: ChartColorToken = 'primary';

export function resolveChartColor(token: ChartColorToken = DEFAULT_CHART_COLOR_TOKEN): string {
  return chartColorTokens[token];
}

export function isChartColorToken(value: string): value is ChartColorToken {
  return value in chartColorTokens;
}
