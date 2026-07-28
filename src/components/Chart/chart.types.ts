import type { ChartDataPoint, DonutSegment } from '@/models/model.type';

import type { ChartColorToken } from '@/config/color.tokens';

export interface ChartDimensions {
  width: number;
  height: number;
  padding: number;
}

export interface LineChartProps {
  points: ChartDataPoint[];
  unit?: string;
  height?: number;
  colorToken?: ChartColorToken;
  class?: string;
  animated?: boolean;
  showValues?: boolean;
  showYAxis?: boolean;
  /** Skeleton placeholders matching this chart shape and `points.length` (fallback 6). */
  isLoading?: boolean;
}

export interface BarChartProps {
  points: ChartDataPoint[];
  height?: number;
  colorToken?: ChartColorToken;
  class?: string;
  animated?: boolean;
  showValues?: boolean;
  showYAxis?: boolean;
  /** Skeleton placeholders matching this chart shape and `points.length` (fallback 7). */
  isLoading?: boolean;
}

export interface DonutChartProps {
  segments: Array<DonutSegment & { label: string }>;
  total: number;
  size?: number | null;
  class?: string;
  animated?: boolean;
  centerLabel?: string;
  legendPosition?: 'auto' | 'center' | 'bottom' | 'right';
  /** Skeleton placeholders matching this chart shape and `segments.length` (fallback 3). */
  isLoading?: boolean;
}

export interface MetricCardProps {
  title: string;
  class?: string;
}
