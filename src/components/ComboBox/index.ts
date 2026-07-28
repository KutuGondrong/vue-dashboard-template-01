export { default as ComboBox } from './ComboBox.vue';
export { ComboBox as ComboBoxCore } from './ComboBoxCore';
export type {
  ComboBoxProps,
  ComboBoxAddOptionConfig,
  ComboBoxAddFieldConfig,
  ComboBoxAddRenderContext,
  ComboBoxAccessors,
  ComboBoxChangeValue,
  ComboBoxNormalizedOption,
  ComboBoxPrimitive,
  ComboBoxValueProp,
} from './comboBox.types';
export { ComboBoxItemKind } from './comboBox.types';
export {
  createComboBoxAccessors,
  createSelectOptionAccessors,
  normalizeComboBoxOptions,
  buildItemFromStringAdd,
  buildItemFromObjectAdd,
  buildItemFromFieldsAdd,
  buildAddedItemFromFields,
  getNestedValue,
  hasNestedPath,
  setNestedValue,
  getFirstSelectableOption,
  isComboBoxValueUnset,
  matchesComboBoxValue,
  resolveComboBoxItemKind,
  resolveAddFields,
} from './comboBoxUtils';
