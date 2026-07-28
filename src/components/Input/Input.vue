<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue';
import { ValidateOn, validateInputValue } from './inputValidation';
import { INPUT_DEFAULT_DEBOUNCE_SECONDS, type InputProps } from './input.types';

const props = withDefaults(defineProps<InputProps>(), {
  validateOn: ValidateOn.Blur,
  debounceSeconds: INPUT_DEFAULT_DEBOUNCE_SECONDS,
  floatingLabel: false,
  type: 'text',
  autocomplete: 'off',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  change: [value: string];
  blur: [event: FocusEvent];
}>();

const generatedId = useId();
const id = computed(() => props.id ?? generatedId);
const errorId = computed(() => `${id.value}-error`);
const hintId = computed(() => `${id.value}-hint`);

const suppressSuggestions = computed(() => (props.autocomplete || 'off') === 'off');
const resolvedAutocomplete = computed(() => {
  const value = props.autocomplete || 'off';
  return value === 'off' ? `off-${id.value}` : value;
});

const internalValue = ref(props.modelValue ?? '');
const internalError = ref<string | undefined>();
const touched = ref(false);
let debounceTimeout: ReturnType<typeof setTimeout> | undefined;

watch(
  () => props.modelValue,
  (value) => {
    if (value !== undefined) internalValue.value = value;
  },
);

onBeforeUnmount(() => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
});

const displayError = computed(() => props.error ?? internalError.value);

const runValidation = (value: string) => {
  if (!props.rules?.length) {
    internalError.value = undefined;
    return undefined;
  }
  const message = validateInputValue(value, props.rules);
  internalError.value = message;
  return message;
};

const emitChange = (value: string) => {
  const fire = () => {
    emit('update:modelValue', value);
    emit('change', value);
  };

  if (props.debounceSeconds === undefined || props.debounceSeconds <= 0) {
    fire();
    return;
  }

  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(fire, props.debounceSeconds * 1000);
};

const handleInput = (event: Event) => {
  const nextValue = (event.target as HTMLInputElement).value;
  internalValue.value = nextValue;

  if (
    props.rules?.length &&
    (props.validateOn === ValidateOn.Change ||
      props.validateOn === ValidateOn.Both ||
      touched.value)
  ) {
    runValidation(nextValue);
  } else if (!props.error) {
    internalError.value = undefined;
  }

  emitChange(nextValue);
};

const handleBlur = (event: FocusEvent) => {
  touched.value = true;
  if (
    props.rules?.length &&
    (props.validateOn === ValidateOn.Blur || props.validateOn === ValidateOn.Both)
  ) {
    runValidation((event.target as HTMLInputElement).value);
  }
  emit('blur', event);
};

const stateClasses = computed(() =>
  displayError.value
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-400'
    : 'border-stone-300 focus:border-primary-500 focus:ring-primary-500/20 dark:border-surface-500',
);

const baseInputClasses =
  'block w-full rounded-lg border bg-white text-sm text-stone-900 transition-colors focus:outline-none focus:ring-2 read-only:cursor-default read-only:bg-stone-50 dark:bg-surface-800 dark:text-stone-100 dark:read-only:bg-stone-800/60';
</script>

<template>
  <div
    v-if="floatingLabel && label"
    class="relative w-full pt-2"
  >
    <div class="relative">
      <span
        v-if="$slots.leftIcon"
        class="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-stone-400"
      >
        <slot name="leftIcon" />
      </span>

      <input
        :id="id"
        :value="internalValue"
        placeholder=" "
        :type="type"
        :disabled="disabled"
        :readonly="readonly"
        :autocomplete="resolvedAutocomplete"
        :name="suppressSuggestions ? `${id}-field` : undefined"
        :data-1p-ignore="suppressSuggestions || undefined"
        :data-lpignore="suppressSuggestions ? 'true' : undefined"
        :data-form-type="suppressSuggestions ? 'other' : undefined"
        :aria-invalid="!!displayError"
        :aria-describedby="displayError ? errorId : hint ? hintId : undefined"
        :class="[
          baseInputClasses,
          stateClasses,
          'peer h-[3.25rem] pb-2 pt-6 placeholder:text-transparent',
          $slots.leftIcon ? 'pl-10' : 'px-3',
          $slots.rightIcon ? 'pr-10' : $slots.leftIcon ? 'pr-3' : '',
        ]"
        @input="handleInput"
        @blur="handleBlur"
      >

      <label
        :for="id"
        :class="[
          'pointer-events-none absolute top-1/2 z-10 max-w-[calc(100%-1.5rem)] -translate-y-1/2 truncate bg-transparent px-0 text-sm font-normal text-stone-500 transition-all duration-200 ease-out dark:text-stone-400',
          'peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:bg-white peer-focus:px-1.5 peer-focus:text-xs peer-focus:font-normal peer-focus:text-stone-500',
          'peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-normal peer-[:not(:placeholder-shown)]:text-stone-500',
          'dark:peer-focus:bg-surface-800 dark:peer-focus:text-stone-400 dark:peer-[:not(:placeholder-shown)]:bg-surface-800 dark:peer-[:not(:placeholder-shown)]:text-stone-400',
          $slots.leftIcon
            ? 'left-10 peer-focus:left-3 peer-[:not(:placeholder-shown)]:left-3'
            : 'left-3',
        ]"
      >
        {{ label }}
      </label>

      <span
        v-if="$slots.rightIcon"
        class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
      >
        <slot name="rightIcon" />
      </span>
    </div>

    <div class="field-message-spacer min-h-[1.25rem]">
      <p
        v-if="displayError"
        :id="errorId"
        class="mt-1.5 text-xs text-red-600 dark:text-red-400"
        role="alert"
      >
        {{ displayError }}
      </p>
      <p
        v-else-if="hint"
        :id="hintId"
        class="mt-1.5 text-xs text-stone-500 dark:text-stone-400"
      >
        {{ hint }}
      </p>
    </div>
  </div>

  <div
    v-else
    class="w-full"
  >
    <label
      v-if="label"
      :for="id"
      class="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300"
    >
      {{ label }}
    </label>
    <div class="relative">
      <span
        v-if="$slots.leftIcon"
        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
      >
        <slot name="leftIcon" />
      </span>
      <input
        :id="id"
        :value="internalValue"
        :placeholder="placeholder"
        :type="type"
        :disabled="disabled"
        :readonly="readonly"
        :autocomplete="resolvedAutocomplete"
        :name="suppressSuggestions ? `${id}-field` : undefined"
        :data-1p-ignore="suppressSuggestions || undefined"
        :data-lpignore="suppressSuggestions ? 'true' : undefined"
        :data-form-type="suppressSuggestions ? 'other' : undefined"
        :aria-invalid="!!displayError"
        :aria-describedby="displayError ? errorId : hint ? hintId : undefined"
        :class="[
          baseInputClasses,
          'px-3 py-2.5 placeholder:text-stone-400 dark:placeholder:text-stone-500',
          stateClasses,
          $slots.leftIcon ? 'pl-10' : '',
          $slots.rightIcon ? 'pr-10' : '',
        ]"
        @input="handleInput"
        @blur="handleBlur"
      >
      <span
        v-if="$slots.rightIcon"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
      >
        <slot name="rightIcon" />
      </span>
    </div>
    <div class="field-message-spacer min-h-[1.25rem]">
      <p
        v-if="displayError"
        :id="errorId"
        class="mt-1 text-xs text-red-600 dark:text-red-400"
        role="alert"
      >
        {{ displayError }}
      </p>
      <p
        v-else-if="hint"
        :id="hintId"
        class="mt-1 text-xs text-stone-500 dark:text-stone-400"
      >
        {{ hint }}
      </p>
    </div>
  </div>
</template>
