import type { VNode } from 'vue';
import type { SelectOption } from '@/models/model.type';

export type ComboBoxPrimitive = string | number;

/** Selected item shape — full item type, not just valueKey */
export type ComboBoxChangeValue<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends SelectOption
      ? SelectOption
      : T;

/**
 * Controlled value — accepts full item or primitive at valueKey (for shorthand).
 * valueKey is used internally for matching/filtering only.
 */
export type ComboBoxValueProp<T> = T extends SelectOption
  ? ComboBoxChangeValue<T> | SelectOption['value']
  : T extends string | number
    ? T
    : ComboBoxChangeValue<T> | ComboBoxPrimitive;

/** Inferred item source — matches ComboBox data shape */
export enum ComboBoxItemKind {
  Options = 'options',
  String = 'string',
  Model = 'model',
}

/** Single field in the add form (1 or more per addOption) */
export interface ComboBoxAddFieldConfig {
  /** Object path written on submit — e.g. 'name', 'balance', 'label' */
  key: string;
  /** Label shown above the input */
  label?: string;
  placeholder?: string;
  type?: 'text' | 'number';
  /** Default true — set false to allow empty values */
  required?: boolean;
}

/** Context passed to renderAdd for fully custom add UI */
export interface ComboBoxAddRenderContext {
  values: Record<string, string>;
  setValue: (key: string, value: string) => void;
  error?: string;
  setError: (error?: string) => void;
  submit: () => void;
  reset: () => void;
  addButtonLabel: string;
  fields?: ComboBoxAddFieldConfig[];
  onAdd: (item: unknown) => void;
}

/** Config for inline "add new option" in the dropdown */
export interface ComboBoxAddOptionConfig<T = unknown> {
  enabled?: boolean;
  /** Used only when fields is omitted — defaults to ComboBox labelKey */
  labelField?: string;
  /** Used only when fields is omitted — defaults to ComboBox valueKey */
  valueField?: string;
  /** Optional section heading above the add form — omitted when not set */
  sectionLabel?: string;
  /** Button text — optional, defaults to "Add" when omitted */
  addButtonLabel?: string;
  /**
   * Add form fields — 1 or more labeled inputs + shared Add button.
   * @example
   * fields: [
   *   { key: 'name', label: 'Name', placeholder: 'Enter name' },
   *   { key: 'balance', label: 'Balance', placeholder: '0', type: 'number' },
   * ]
   */
  fields?: ComboBoxAddFieldConfig[];
  /** Fully custom add layout — alternative to default fields UI */
  renderAdd?: (context: ComboBoxAddRenderContext) => VNode;
  onAdd: (item: T) => void;
}

export interface ComboBoxAccessors<T> {
  getLabel: (item: T) => string;
  getValue: (item: T) => ComboBoxPrimitive;
  isDisabled?: (item: T) => boolean;
}

export interface ComboBoxNormalizedOption<T> {
  item: T;
  label: string;
  value: string;
  disabled: boolean;
}

export interface ComboBoxProps<T = SelectOption> {
  options?: SelectOption[];
  items?: T[];
  /** Controlled selected item (or primitive at valueKey) */
  value?: ComboBoxValueProp<T>;
  /** Initial selection when uncontrolled — omit for empty state */
  defaultValue?: ComboBoxValueProp<T>;
  /** Fired when user picks an option — receives item and its index in the items array */
  onSelect?: (item: T, index: number) => void;
  labelKey?: string;
  valueKey?: string;
  getLabel?: (item: T) => string;
  getValue?: (item: T) => ComboBoxPrimitive;
  /** Custom option display in the dropdown — e.g. name on top, balance below */
  renderLabel?: (item: T) => VNode;
  /** Custom display when closed/selected — e.g. name only. Falls back to labelKey text when omitted */
  renderSelectedLabel?: (item: T) => VNode;
  /** Field paths used for search filter (e.g. ['name', 'balance']) */
  searchKeys?: string[];
  /** Override combined search text per item */
  getSearchText?: (item: T) => string;
  isDisabled?: (item: T) => boolean;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  searchable?: boolean;
  autocomplete?: string;
  class?: string;
  addOption?: ComboBoxAddOptionConfig<T>;
}
