<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue';
import { ValidateOn, validateInputValue } from './inputValidation';
import type { TextareaProps } from './input.types';

const props = withDefaults(defineProps<TextareaProps>(), {
  validateOn: ValidateOn.Blur,
  rows: 4,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  blur: [event: FocusEvent];
}>();

const generatedId = useId();
const id = computed(() => props.id ?? generatedId);
const errorId = computed(() => `${id.value}-error`);
const hintId = computed(() => `${id.value}-hint`);

const internalValue = ref(props.modelValue ?? '');
const internalError = ref<string | undefined>();
const touched = ref(false);

watch(
  () => props.modelValue,
  (value) => {
    if (value !== undefined) internalValue.value = value;
  },
);

const displayError = computed(() => props.error ?? internalError.value);

const runValidation = (value: string) => {
  if (!props.rules?.length) {
    internalError.value = undefined;
    return;
  }
  internalError.value = validateInputValue(value, props.rules);
};

const handleInput = (event: Event) => {
  const nextValue = (event.target as HTMLTextAreaElement).value;
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

  emit('update:modelValue', nextValue);
};

const handleBlur = (event: FocusEvent) => {
  touched.value = true;
  if (
    props.rules?.length &&
    (props.validateOn === ValidateOn.Blur || props.validateOn === ValidateOn.Both)
  ) {
    runValidation((event.target as HTMLTextAreaElement).value);
  }
  emit('blur', event);
};

const stateClasses = computed(() =>
  displayError.value
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-400'
    : 'border-stone-300 focus:border-primary-500 focus:ring-primary-500/20 dark:border-surface-500',
);
</script>

<template>
  <div class="w-full">
    <label
      v-if="label"
      :for="id"
      class="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300"
    >
      {{ label }}
    </label>
    <textarea
      :id="id"
      :value="internalValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :rows="rows"
      :aria-invalid="!!displayError"
      :aria-describedby="displayError ? errorId : undefined"
      :class="[
        'block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-stone-900 transition-colors placeholder:text-stone-400 focus:outline-none focus:ring-2 dark:bg-surface-800 dark:text-stone-100 dark:placeholder:text-stone-500',
        stateClasses,
      ]"
      @input="handleInput"
      @blur="handleBlur"
    />
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
