import type { InjectionKey } from 'vue';

export type SplitterDirection = 'horizontal' | 'vertical';

export interface SplitterPanelProps {
  defaultSize?: number | string;
  min?: number;
  max?: number;
  collapsible?: boolean;
}

export interface SplitterContextValue {
  direction: SplitterDirection;
  registerPanel: (panelProps: SplitterPanelProps) => number;
  sizes: () => number[];
  startDrag: (index: number, startPos: number) => void;
  panelCount: () => number;
}

export const SplitterContextKey: InjectionKey<SplitterContextValue> = Symbol('SplitterContext');

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed' | 'dotted';
export type DividerLabelPosition = 'left' | 'center' | 'right';

export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
export type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
export type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

export type SpaceDirection = 'horizontal' | 'vertical';
export type SpaceSize = 'sm' | 'md' | 'lg';
export type SpaceAlign = 'start' | 'center' | 'end' | 'baseline';
