import { ref, computed } from 'vue';
import { ValidateOn, type ValidationRule, validateInputValue } from './inputValidation';

interface UseInputValidationOptions {
  rules?: ValidationRule[];
  validateOn?: ValidateOn;
  initialValue?: string;
}

export function useInputValidation({
  rules = [],
  validateOn = ValidateOn.Blur,
  initialValue = '',
}: UseInputValidationOptions = {}) {
  const value = ref(initialValue);
  const error = ref<string | undefined>();
  const touched = ref(false);

  const validate = (nextValue: string = value.value): string | undefined => {
    if (rules.length === 0) {
      error.value = undefined;
      return undefined;
    }
    const message = validateInputValue(nextValue, rules);
    error.value = message;
    return message;
  };

  const handleChange = (nextValue: string) => {
    value.value = nextValue;
    if (validateOn === ValidateOn.Change || validateOn === ValidateOn.Both || touched.value) {
      validate(nextValue);
    } else {
      error.value = undefined;
    }
  };

  const handleBlur = () => {
    touched.value = true;
    if (validateOn === ValidateOn.Blur || validateOn === ValidateOn.Both || touched.value) {
      validate(value.value);
    }
  };

  const reset = () => {
    value.value = initialValue;
    error.value = undefined;
    touched.value = false;
  };

  const setValue = (nextValue: string) => {
    value.value = nextValue;
  };

  const setError = (nextError: string | undefined) => {
    error.value = nextError;
  };

  const isValid = computed(() => !validateInputValue(value.value, rules));

  return {
    value,
    error,
    touched,
    isValid,
    setValue,
    setError,
    validate,
    handleChange,
    handleBlur,
    reset,
    inputProps: computed(() => ({
      value: value.value,
      error: error.value,
      onChange: (event: Event) => handleChange((event.target as HTMLInputElement).value),
      onBlur: handleBlur,
    })),
  };
}
