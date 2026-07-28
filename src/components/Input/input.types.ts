import { ValidateOn, type ValidationRule } from './inputValidation';

export const INPUT_DEFAULT_DEBOUNCE_SECONDS = 0.3;

export interface InputProps {
  label?: string;
  error?: string;
  hint?: string;
  floatingLabel?: boolean;
  rules?: ValidationRule[];
  validateOn?: ValidateOn;
  debounceSeconds?: number;
  modelValue?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  readonly?: boolean;
  autocomplete?: string;
  id?: string;
}

export interface TextareaProps {
  label?: string;
  error?: string;
  hint?: string;
  rules?: ValidationRule[];
  validateOn?: ValidateOn;
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  rows?: number;
  id?: string;
}
