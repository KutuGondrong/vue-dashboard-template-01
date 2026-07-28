<script setup lang="ts">
import { ref, computed, watch, type PropType } from 'vue';
import { useLocale } from '@/locales/localeStore';

type ToggleSize = 'sm' | 'md';
type ToggleLabelPosition = 'left' | 'right';

export interface ToggleProps {
  checked?: boolean;
  defaultChecked?: boolean;
  size?: ToggleSize;
  label?: string;
  labelPosition?: ToggleLabelPosition;
  disabled?: boolean;
  class?: string;
}

const props = defineProps({
  checked: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  defaultChecked: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String as PropType<ToggleSize>,
    default: 'md',
  },
  label: {
    type: String,
    default: undefined,
  },
  labelPosition: {
    type: String as PropType<ToggleLabelPosition>,
    default: 'right',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  class: {
    type: String,
    default: '',
  },
});

const emit = defineEmits<{
  change: [checked: boolean];
}>();

const { t } = useLocale();
const internalChecked = ref(props.defaultChecked);
const isControlled = computed(() => props.checked !== undefined);
const isChecked = computed(() => (isControlled.value ? props.checked! : internalChecked.value));
const resolvedAriaLabel = computed(() => props.label ?? t('components.common.toggle'));

watch(
  () => props.defaultChecked,
  (next) => {
    if (!isControlled.value) {
      internalChecked.value = next;
    }
  },
);
const trackSizeClasses: Record<ToggleSize, string> = {
  sm: 'h-5 w-9',
  md: 'h-6 w-11',
};

const thumbSizeClasses: Record<ToggleSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
};

const thumbOnTranslateClasses: Record<ToggleSize, string> = {
  sm: 'translate-x-4',
  md: 'translate-x-5',
};

function handleToggle() {
  if (props.disabled) return;
  const next = !isChecked.value;
  if (!isControlled.value) {
    internalChecked.value = next;
  }
  emit('change', next);
}
</script>

<template>
  <label
    v-if="label"
    :class="[
      'flex cursor-pointer items-center gap-3',
      disabled ? 'cursor-not-allowed opacity-50' : '',
      labelPosition === 'left' ? 'flex-row-reverse justify-end' : '',
    ]"
  >
    <span class="text-sm text-stone-700 dark:text-stone-300">{{ label }}</span>
    <button
      type="button"
      role="switch"
      :aria-checked="isChecked"
      :aria-label="label ? undefined : resolvedAriaLabel"
      :disabled="disabled"
      :class="[
        'relative shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-surface-900',
        isChecked ? 'bg-primary-600 dark:bg-primary-500' : 'bg-stone-300 dark:bg-surface-500',
        trackSizeClasses[size],
        props.class,
      ]"
      @click="handleToggle"
    >
      <span
        aria-hidden="true"
        :class="[
          'absolute left-0.5 top-0.5 rounded-full bg-white transition-transform',
          thumbSizeClasses[size],
          isChecked ? thumbOnTranslateClasses[size] : 'translate-x-0',
        ]"
      />
    </button>
  </label>

  <button
    v-else
    type="button"
    role="switch"
    :aria-checked="isChecked"
    :aria-label="resolvedAriaLabel"
    :disabled="disabled"
    :class="[
      'relative shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-surface-900',
      isChecked ? 'bg-primary-600 dark:bg-primary-500' : 'bg-stone-300 dark:bg-surface-500',
      trackSizeClasses[size],
      props.class,
    ]"
    @click="handleToggle"
  >
    <span
      aria-hidden="true"
      :class="[
        'absolute left-0.5 top-0.5 rounded-full bg-white transition-transform',
        thumbSizeClasses[size],
        isChecked ? thumbOnTranslateClasses[size] : 'translate-x-0',
      ]"
    />
  </button>
</template>
