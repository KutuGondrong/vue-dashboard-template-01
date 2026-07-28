import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useLocaleStore } from '@/locales/localeStore';
import { ValidationError } from '@/core/errors/ValidationError';
import type { LoginCredentials, RegisterCredentials } from '@/models/model.type';

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  credentials?: string;
}

function buildRedirectPath(target: RouteLocationNormalized | null) {
  if (!target) return '/dashboard';
  return `${target.path}${target.fullPath.slice(target.path.length)}`;
}

export const useAuthFormStore = defineStore('authForm', () => {
  const authStore = useAuthStore();
  const localeStore = useLocaleStore();

  const mode = ref<'login' | 'register'>('login');
  const errors = ref<FormErrors>({});

  function setMode(next: 'login' | 'register'): void {
    mode.value = next;
    errors.value = {};
  }

  function validateLogin(credentials: LoginCredentials): FormErrors {
    const newErrors: FormErrors = {};
    if (!credentials.email.trim()) {
      newErrors.email = localeStore.t('auth.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      newErrors.email = localeStore.t('auth.emailInvalid');
    }
    if (!credentials.password) {
      newErrors.password = localeStore.t('auth.passwordRequired');
    }
    return newErrors;
  }

  function validateRegister(credentials: RegisterCredentials): FormErrors {
    const loginErrors = validateLogin(credentials);
    const newErrors: FormErrors = { ...loginErrors };
    if (credentials.password.length < 6) {
      newErrors.password = localeStore.t('auth.passwordMinLength');
    }
    if (!credentials.confirmPassword) {
      newErrors.confirmPassword = localeStore.t('auth.confirmPasswordRequired');
    } else if (credentials.password !== credentials.confirmPassword) {
      newErrors.confirmPassword = localeStore.t('auth.passwordMismatch');
    }
    return newErrors;
  }

  async function submitLogin(
    credentials: LoginCredentials,
    redirectTarget: RouteLocationNormalized | null,
    routerReplace: (path: string) => Promise<void>,
  ): Promise<boolean> {
    const validationErrors = validateLogin(credentials);
    if (Object.keys(validationErrors).length > 0) {
      errors.value = validationErrors;
      return false;
    }

    errors.value = {};
    try {
      await authStore.login(credentials);
      await routerReplace(buildRedirectPath(redirectTarget));
      return true;
    } catch (error) {
      if (error instanceof ValidationError) {
        if (error.field === 'credentials') {
          errors.value = { credentials: localeStore.t('auth.invalidCredentials') };
        } else {
          errors.value = { [error.field]: error.message };
        }
      } else {
        errors.value = { credentials: localeStore.t('components.common.error') };
      }
      return false;
    }
  }

  async function submitRegister(
    credentials: RegisterCredentials,
    routerReplace: (path: string) => Promise<void>,
  ): Promise<boolean> {
    const validationErrors = validateRegister(credentials);
    if (Object.keys(validationErrors).length > 0) {
      errors.value = validationErrors;
      return false;
    }

    errors.value = {};
    try {
      await authStore.register(credentials);
      await routerReplace('/dashboard');
      return true;
    } catch (error) {
      if (error instanceof ValidationError) {
        errors.value = { [error.field]: error.message };
      } else {
        errors.value = { credentials: localeStore.t('components.common.error') };
      }
      return false;
    }
  }

  function clearFieldError(field: keyof FormErrors): void {
    const next = { ...errors.value };
    delete next[field];
    errors.value = next;
  }

  return {
    mode,
    errors,
    setMode,
    submitLogin,
    submitRegister,
    clearFieldError,
  };
});
