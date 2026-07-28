import {
  Fragment,
  Teleport,
  h,
  type VNode,
  ref,
  computed,
  watch,
  nextTick,
  onMounted,
  onUnmounted,
  useId,
  defineComponent,
} from 'vue';
import { useLocale } from '@/locales/localeStore';
import type { SelectOption } from '@/models/model.type';
import type { ComboBoxProps, ComboBoxValueProp, ComboBoxAddOptionConfig } from './comboBox.types';
import {
  buildAddedItemFromFields,
  createComboBoxAccessors,
  createSelectOptionAccessors,
  matchesComboBoxValue,
  normalizeComboBoxOptions,
  getItemSearchText,
  resolveAddFields,
  resolveComboBoxItemKind,
} from './comboBoxUtils';

export function ComboBox(
  props: ComboBoxProps<SelectOption> & { options: SelectOption[]; items?: never },
): VNode;
export function ComboBox<T>(props: ComboBoxProps<T> & { items: T[]; options?: never }): VNode;
export function ComboBox<T = SelectOption>(props: ComboBoxProps<T>): VNode;

const ComboBoxCore = defineComponent({
  name: 'ComboBoxCore',
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
    class: { type: String, default: '' },
    addOption: { type: Object, default: undefined },
    onSelect: { type: Function, default: undefined },
  },
  setup(rawProps) {
    return createComboBoxRender(rawProps as ComboBoxProps<SelectOption>);
  },
});

export { ComboBoxCore };

export function ComboBox<T = SelectOption>(props: ComboBoxProps<T>): VNode {
  return h(ComboBoxCore as never, props as never);
}

function createComboBoxRender<T = SelectOption>(props: ComboBoxProps<T>) {
  const { t } = useLocale();
  const resolvedPlaceholder = computed(
    () => props.placeholder ?? t('components.common.selectOption'),
  );
  const formatFieldRequired = (field: string) => t('components.common.fieldRequired', { field });
  const addFieldDefaults = computed(() => ({
    valueLabel: t('components.common.fieldValue'),
    labelLabel: t('components.common.fieldLabel'),
    enterValue: t('components.common.enterValue'),
    enterLabel: t('components.common.enterLabel'),
  }));

  const isControlled = computed(() => props.value !== undefined);
  const internalValue = ref<ComboBoxValueProp<T> | undefined>(props.defaultValue);

  const id = useId();
  const listboxId = `${id}-listbox`;
  const errorId = `${id}-error`;
  const containerRef = ref<HTMLDivElement | null>(null);
  const inputRef = ref<HTMLInputElement | null>(null);
  const listboxRef = ref<HTMLUListElement | null>(null);

  const isOpen = ref(false);
  const search = ref('');
  const highlightedIndex = ref<number | null>(null);
  const addFieldValues = ref<Record<string, string>>({});
  const addError = ref<string | undefined>();
  const listboxPosition = ref<{
    top?: string;
    bottom?: string;
    left: string;
    width: string;
    maxHeight: string;
  } | null>(null);
  const portalThemeClass = ref('');

  const LISTBOX_MAX_HEIGHT = 240;
  const LISTBOX_GAP = 4;
  const VIEWPORT_PADDING = 8;

  const updateListboxPosition = () => {
    const anchor = inputRef.value;
    if (!anchor || !isOpen.value) {
      listboxPosition.value = null;
      return;
    }

    const rect = anchor.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - LISTBOX_GAP - VIEWPORT_PADDING;
    const spaceAbove = rect.top - LISTBOX_GAP - VIEWPORT_PADDING;
    const openAbove = spaceBelow < Math.min(LISTBOX_MAX_HEIGHT, 120) && spaceAbove > spaceBelow;
    const available = openAbove ? spaceAbove : spaceBelow;
    const maxHeight = Math.max(0, Math.min(LISTBOX_MAX_HEIGHT, available));

    listboxPosition.value = openAbove
      ? {
          bottom: `${window.innerHeight - rect.top + LISTBOX_GAP}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          maxHeight: `${maxHeight}px`,
        }
      : {
          top: `${rect.bottom + LISTBOX_GAP}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          maxHeight: `${maxHeight}px`,
        };

    const root = containerRef.value;
    portalThemeClass.value = root?.closest('.dark') ? 'dark' : '';
  };

  const sourceItems = computed(() => {
    if (props.options) return props.options as unknown as T[];
    return props.items ?? [];
  });

  const accessors = computed(() =>
    props.options
      ? (createSelectOptionAccessors() as ReturnType<typeof createComboBoxAccessors<T>>)
      : createComboBoxAccessors({
          items: sourceItems.value,
          labelKey: props.labelKey,
          valueKey: props.valueKey,
          getLabel: props.getLabel,
          getValue: props.getValue,
          isDisabled: props.isDisabled,
        }),
  );

  const normalizedOptions = computed(() =>
    normalizeComboBoxOptions(sourceItems.value, accessors.value),
  );

  const effectiveValue = computed(() => (isControlled.value ? props.value : internalValue.value));

  const selectedOption = computed(() =>
    normalizedOptions.value.find((opt) =>
      matchesComboBoxValue(effectiveValue.value, opt.item, accessors.value),
    ),
  );
  const selectedKey = computed(() => selectedOption.value?.value);

  const emitSelect = (option: (typeof normalizedOptions.value)[number]) => {
    const index = sourceItems.value.findIndex(
      (item) => String(accessors.value.getValue(item)) === option.value,
    );
    if (!isControlled.value) {
      internalValue.value = option.item as ComboBoxValueProp<T>;
    }
    props.onSelect?.(option.item, index >= 0 ? index : 0);
  };

  const filteredOptions = computed(() => {
    if (!props.searchable) return normalizedOptions.value;
    const query = search.value.toLowerCase();
    return normalizedOptions.value.filter((opt) =>
      getItemSearchText(opt.item, accessors.value, props.searchKeys, props.getSearchText).includes(
        query,
      ),
    );
  });

  const close = () => {
    isOpen.value = false;
    search.value = '';
    highlightedIndex.value = null;
    addFieldValues.value = {};
    addError.value = undefined;
    listboxPosition.value = null;
  };

  const open = () => {
    if (props.disabled) return;
    isOpen.value = true;
    updateListboxPosition();
    void nextTick(updateListboxPosition);
  };

  const toggle = () => {
    if (props.disabled) return;
    if (isOpen.value) {
      close();
      inputRef.value?.blur();
      return;
    }
    open();
    inputRef.value?.focus();
  };

  /** Non-searchable: toggle on mousedown so focus→open does not immediately reopen on click. */
  const handleInputMouseDown = (event: MouseEvent) => {
    if (props.disabled || props.searchable) return;
    event.preventDefault();
    toggle();
  };

  const handleInputFocus = () => {
    if (props.disabled) return;
    open();
  };

  const handleToggleButtonClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggle();
  };

  watch(isOpen, (openState) => {
    if (openState) void nextTick(updateListboxPosition);
  });

  let removeOutsideAndPositionListeners: (() => void) | undefined;
  onMounted(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inTrigger = containerRef.value?.contains(target);
      const inListbox = listboxRef.value?.contains(target);
      if (!inTrigger && !inListbox) {
        close();
      }
    };
    const handleReposition = () => {
      if (isOpen.value) updateListboxPosition();
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);
    removeOutsideAndPositionListeners = () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
  });
  onUnmounted(() => {
    removeOutsideAndPositionListeners?.();
  });
  const handleSelect = (option: (typeof normalizedOptions.value)[number]) => {
    if (option.disabled) return;
    emitSelect(option);
    close();
  };

  const setAddFieldValue = (key: string, nextValue: string) => {
    addFieldValues.value = { ...addFieldValues.value, [key]: nextValue };
    addError.value = undefined;
  };

  const resetAddForm = () => {
    addFieldValues.value = {};
    addError.value = undefined;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isOpen.value) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        const last = filteredOptions.value.length - 1;
        if (last < 0) break;
        highlightedIndex.value =
          highlightedIndex.value === null ? 0 : Math.min(highlightedIndex.value + 1, last);
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const last = filteredOptions.value.length - 1;
        if (last < 0) break;
        highlightedIndex.value =
          highlightedIndex.value === null ? last : Math.max(highlightedIndex.value - 1, 0);
        break;
      }
      case 'Enter':
        event.preventDefault();
        if (highlightedIndex.value !== null && filteredOptions.value[highlightedIndex.value]) {
          handleSelect(filteredOptions.value[highlightedIndex.value]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        close();
        inputRef.value?.blur();
        break;
    }
  };

  const stateClasses = computed(() =>
    props.error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      : 'border-stone-300 focus:border-primary-500 focus:ring-primary-500/20 dark:border-surface-500',
  );

  const showAddRow = computed(() => Boolean(props.addOption?.enabled && props.addOption?.onAdd));

  const itemKind = computed(() =>
    resolveComboBoxItemKind(Boolean(props.options), sourceItems.value),
  );

  const addFields = computed(() =>
    resolveAddFields(
      props.addOption as ComboBoxAddOptionConfig | undefined,
      props.labelKey,
      props.valueKey,
      itemKind.value,
      addFieldDefaults.value,
    ),
  );

  const addButtonLabel = computed(
    () => props.addOption?.addButtonLabel ?? t('components.common.add'),
  );

  const handleContextAdd = (item: unknown) => {
    props.addOption?.onAdd(item as T);
    resetAddForm();
  };

  const handleAddOption = () => {
    if (!props.addOption?.onAdd) return;

    try {
      const newItem = buildAddedItemFromFields<T>(
        addFieldValues.value,
        addFields.value,
        itemKind.value,
        formatFieldRequired,
      );
      handleContextAdd(newItem);
    } catch (err) {
      addError.value = err instanceof Error ? err.message : t('components.common.invalidInput');
    }
  };

  const addRenderContext = computed(() => ({
    values: addFieldValues.value,
    setValue: setAddFieldValue,
    error: addError.value,
    setError: (next: string | undefined) => {
      addError.value = next;
    },
    submit: handleAddOption,
    reset: resetAddForm,
    addButtonLabel: addButtonLabel.value,
    fields: addFields.value,
    onAdd: handleContextAdd,
  }));

  const addInputClassName =
    'block w-full rounded-md border border-stone-300 bg-white px-2 py-1.5 text-xs text-stone-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-surface-500 dark:bg-surface-800 dark:text-stone-100';

  const renderDefaultAddForm = () => {
    if (props.addOption?.renderAdd) {
      return props.addOption.renderAdd(addRenderContext.value);
    }

    return h(Fragment, null, [
      ...addFields.value.map((field) =>
        h('div', { key: field.key, class: 'mb-2' }, [
          field.label
            ? h(
                'label',
                { class: 'mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400' },
                field.label,
              )
            : null,
          h('input', {
            type: field.type === 'number' ? 'number' : 'text',
            value: addFieldValues.value[field.key] ?? '',
            placeholder: field.placeholder,
            onInput: (e: Event) =>
              setAddFieldValue(field.key, (e.target as HTMLInputElement).value),
            class: addInputClassName,
          }),
        ]),
      ),
      addError.value
        ? h('p', { class: 'mb-1 text-xs text-red-600 dark:text-red-400' }, addError.value)
        : null,
      h(
        'button',
        {
          type: 'button',
          onClick: handleAddOption,
          class:
            'w-full rounded-md bg-primary-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-primary-700',
        },
        addButtonLabel.value,
      ),
    ]);
  };

  const closedDisplay = computed(() => {
    if (!selectedOption.value || isOpen.value) return null;

    if (props.renderSelectedLabel) {
      const content = props.renderSelectedLabel(selectedOption.value.item);
      if (typeof content === 'string' || typeof content === 'number') {
        return { kind: 'text' as const, text: String(content) };
      }
      return { kind: 'overlay' as const, node: content };
    }

    return { kind: 'text' as const, text: selectedOption.value.label };
  });

  return () => {
    const showCustomClosed = closedDisplay.value?.kind === 'overlay';
    const closedText =
      closedDisplay.value?.kind === 'text'
        ? closedDisplay.value.text
        : (selectedOption.value?.label ?? '');

    return h('div', { ref: containerRef, class: `relative w-full ${props.class ?? ''}` }, [
      props.label
        ? h(
            'label',
            {
              for: id,
              class: 'mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300',
            },
            props.label,
          )
        : null,
      h('div', { class: 'relative' }, [
        showCustomClosed
          ? h(
              'div',
              {
                class: 'pointer-events-none absolute inset-0 flex items-center px-4 py-2 pr-10',
                'aria-hidden': 'true',
              },
              [closedDisplay.value!.node],
            )
          : null,
        h('input', {
          ref: inputRef,
          id,
          role: 'combobox',
          'aria-expanded': isOpen.value,
          'aria-controls': listboxId,
          'aria-haspopup': 'listbox',
          'aria-invalid': !!props.error,
          'aria-describedby': props.error ? errorId : undefined,
          disabled: props.disabled,
          readOnly: !props.searchable,
          autocomplete: props.searchable ? (props.autocomplete ?? 'off') : 'off',
          value:
            isOpen.value && props.searchable ? search.value : showCustomClosed ? '' : closedText,
          placeholder: showCustomClosed ? undefined : resolvedPlaceholder.value,
          onInput: (e: Event) => {
            search.value = (e.target as HTMLInputElement).value;
            if (!isOpen.value) open();
          },
          onMousedown: handleInputMouseDown,
          onFocus: handleInputFocus,
          onKeydown: handleKeyDown,
          class: `block w-full cursor-pointer rounded-lg border bg-white px-4 py-2.5 pr-10 text-sm text-stone-900 transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-surface-800 dark:text-stone-100 ${showCustomClosed ? 'min-h-[3.25rem]' : ''} ${stateClasses.value}`,
        }),
        h(
          'button',
          {
            type: 'button',
            tabindex: -1,
            disabled: props.disabled,
            'aria-label': isOpen.value
              ? t('components.common.collapseMenu')
              : t('components.common.expandMenu'),
            'aria-expanded': isOpen.value,
            'aria-controls': listboxId,
            onMousedown: (event: MouseEvent) => {
              // Prevent input blur/focus race before click toggles.
              event.preventDefault();
            },
            onClick: handleToggleButtonClick,
            class:
              'absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-surface-600 dark:hover:text-stone-200',
          },
          [
            h(
              'svg',
              {
                class: `h-4 w-4 transition-transform ${isOpen.value ? 'rotate-180' : ''}`,
                fill: 'none',
                viewBox: '0 0 24 24',
                stroke: 'currentColor',
                'aria-hidden': 'true',
              },
              [
                h('path', {
                  'stroke-linecap': 'round',
                  'stroke-linejoin': 'round',
                  'stroke-width': 2,
                  d: 'M19 9l-7 7-7-7',
                }),
              ],
            ),
          ],
        ),
      ]),
      isOpen.value && listboxPosition.value
        ? h(Teleport, { to: 'body' }, [
            h('div', { class: portalThemeClass.value || undefined }, [
              h(
                'ul',
                {
                  ref: listboxRef,
                  id: listboxId,
                  role: 'listbox',
                  class:
                    'fixed z-[200] overflow-auto rounded-lg border border-stone-200 bg-white px-1 py-1.5 shadow-lg dark:border-surface-600 dark:bg-surface-800',
                  style: {
                    top: listboxPosition.value.top,
                    bottom: listboxPosition.value.bottom,
                    left: listboxPosition.value.left,
                    width: listboxPosition.value.width,
                    maxHeight: listboxPosition.value.maxHeight,
                  },
                  onMouseleave: () => {
                    highlightedIndex.value = null;
                  },
                },
                [
                  filteredOptions.value.length === 0
                    ? h(
                        'li',
                        {
                          class: 'rounded-md px-3 py-2 text-sm text-stone-500 dark:text-stone-400',
                        },
                        t('components.common.noOptionsFound'),
                      )
                    : filteredOptions.value.map((option, index) =>
                        h(
                          'li',
                          {
                            key: option.value,
                            role: 'option',
                            'aria-selected': option.value === selectedKey.value,
                            onClick: () => handleSelect(option),
                            onMouseenter: () => {
                              highlightedIndex.value = index;
                            },
                            class: `cursor-pointer rounded-md px-3 py-2 text-sm transition-colors ${
                              option.disabled
                                ? 'cursor-not-allowed text-stone-400'
                                : highlightedIndex.value === index
                                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                                  : option.value === selectedKey.value
                                    ? 'bg-stone-100 text-stone-900 dark:bg-surface-600 dark:text-white'
                                    : 'text-stone-700 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-surface-600'
                            }`,
                          },
                          props.renderLabel ? props.renderLabel(option.item) : option.label,
                        ),
                      ),
                  showAddRow.value
                    ? h('li', { class: 'border-t border-stone-200 p-2 dark:border-surface-600' }, [
                        props.addOption?.sectionLabel
                          ? h(
                              'p',
                              {
                                class:
                                  'mb-2 text-xs font-semibold text-stone-700 dark:text-stone-300',
                              },
                              props.addOption.sectionLabel,
                            )
                          : null,
                        renderDefaultAddForm(),
                      ])
                    : null,
                ],
              ),
            ]),
          ])
        : null,
      h('div', { class: 'field-message-spacer min-h-[1.25rem]' }, [
        props.error
          ? h(
              'p',
              {
                id: errorId,
                class: 'mt-1 text-xs text-red-600 dark:text-red-400',
                role: 'alert',
              },
              props.error,
            )
          : null,
      ]),
    ]);
  };
}

export type { ComboBoxProps } from './comboBox.types';
export type {
  ComboBoxAddOptionConfig,
  ComboBoxAddFieldConfig,
  ComboBoxAddRenderContext,
  ComboBoxAccessors,
  ComboBoxChangeValue,
  ComboBoxNormalizedOption,
  ComboBoxPrimitive,
  ComboBoxValueProp,
} from './comboBox.types';
export {
  createComboBoxAccessors,
  createSelectOptionAccessors,
  normalizeComboBoxOptions,
  buildItemFromFieldsAdd,
  buildAddedItemFromFields,
  getNestedValue,
  hasNestedPath,
  setNestedValue,
  matchesComboBoxValue,
  resolveComboBoxItemKind,
  resolveAddFields,
  getItemSearchText,
} from './comboBoxUtils';
