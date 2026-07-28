export type CodeBlockVariant = 'inline' | 'accordion';

export interface CodeBlockProps {
  code: string;
  variant?: CodeBlockVariant;
  previewLines?: number;
  defaultExpanded?: boolean;
  title?: string;
  hint?: string;
  defaultOpen?: boolean;
  compact?: boolean;
  class?: string;
}
