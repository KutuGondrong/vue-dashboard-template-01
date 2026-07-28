<script lang="ts">
import { defineComponent, h } from 'vue';
import { ComboBoxCore } from './ComboBoxCore';
import type { ComboBoxProps } from './comboBox.types';

export default defineComponent({
  name: 'ComboBox',
  inheritAttrs: false,
  props: {
    options: { type: Array, default: undefined },
    items: { type: Array, default: undefined },
    value: { default: undefined },
    defaultValue: { default: undefined },
    labelKey: { type: String, default: undefined },
    valueKey: { type: String, default: undefined },
    getLabel: { type: Function, default: undefined },
    getValue: { type: Function, default: undefined },
    renderLabel: { type: Function, default: undefined },
    renderSelectedLabel: { type: Function, default: undefined },
    searchKeys: { type: Array, default: undefined },
    getSearchText: { type: Function, default: undefined },
    isDisabled: { type: Function, default: undefined },
    label: { type: String, default: undefined },
    placeholder: { type: String, default: undefined },
    error: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
    searchable: { type: Boolean, default: true },
    autocomplete: { type: String, default: 'off' },
    class: { type: String, default: undefined },
    addOption: { type: Object, default: undefined },
  },
  emits: ['select'],
  setup(props, { attrs, emit }) {
    return () => {
      const passthrough = { ...(attrs as Record<string, unknown>), ...props } as ComboBoxProps;
      const resolvedClass =
        props.class ?? (typeof attrs.class === 'string' ? attrs.class : undefined);

      return h(ComboBoxCore as never, {
        ...passthrough,
        class: resolvedClass,
        onSelect: (item: unknown, index: number) => {
          emit('select', item, index);
        },
      });
    };
  },
});
</script>
