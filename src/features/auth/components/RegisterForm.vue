<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthFormStore } from '@/features/auth/stores/authFormStore';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useLocale } from '@/locales/localeStore';
import AuthFormFooter from '@/features/auth/components/AuthFormFooter.vue';
import AuthFormHeader from '@/features/auth/components/AuthFormHeader.vue';
import { createValidationRules, Input, ValidationRuleType, ValidateOn } from '@/components/Input';
import { Button } from '@/components/Button';

const { t } = useLocale();
const authFormStore = useAuthFormStore();
const authStore = useAuthStore();
const router = useRouter();
const { errors } = storeToRefs(authFormStore);
const { isLoading } = storeToRefs(authStore);

const email = ref('');
const password = ref('');
const confirmPassword = ref('');

onMounted(() => authFormStore.setMode('register'));

const onSubmit = async () => {
  await authFormStore.submitRegister(
    { email: email.value, password: password.value, confirmPassword: confirmPassword.value },
    (path) => router.replace(path),
  );
};
</script>

<template>
  <div class="w-full">
    <AuthFormHeader
      :title="t('auth.registerTitle')"
      :subtitle="t('auth.registerSubtitle')"
    />

    <form
      class="space-y-4"
      @submit.prevent="onSubmit"
    >
      <div
        v-if="errors.credentials"
        class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400"
        role="alert"
      >
        {{ errors.credentials }}
      </div>

      <Input
        v-model="email"
        :label="t('auth.emailLabel')"
        type="email"
        :placeholder="t('auth.emailPlaceholder')"
        :debounce-seconds="0"
        :error="errors.email"
        :rules="
          createValidationRules('email', {
            required: t('auth.emailRequired'),
            email: t('auth.emailInvalid'),
          })
        "
        :validate-on="ValidateOn.Blur"
        autocomplete="email"
        @update:model-value="authFormStore.clearFieldError('email')"
      />

      <Input
        v-model="password"
        :label="t('auth.passwordLabel')"
        type="password"
        :placeholder="t('auth.passwordPlaceholder')"
        :debounce-seconds="0"
        :error="errors.password"
        :rules="
          createValidationRules('password', {
            required: t('auth.passwordRequired'),
            minLength: t('auth.passwordMinLength'),
          })
        "
        :validate-on="ValidateOn.Blur"
        autocomplete="new-password"
        @update:model-value="authFormStore.clearFieldError('password')"
      />

      <Input
        v-model="confirmPassword"
        :label="t('auth.confirmPasswordLabel')"
        type="password"
        :placeholder="t('auth.confirmPasswordPlaceholder')"
        :debounce-seconds="0"
        :error="errors.confirmPassword"
        :rules="[
          { type: ValidationRuleType.Required, message: t('auth.confirmPasswordRequired') },
          {
            type: ValidationRuleType.Custom,
            validate: (value: string) => value === password || t('auth.passwordMismatch'),
          },
        ]"
        :validate-on="ValidateOn.Blur"
        autocomplete="new-password"
        @update:model-value="authFormStore.clearFieldError('confirmPassword')"
      />

      <div class="pt-1">
        <Button
          type="submit"
          full-width
          :is-loading="isLoading"
        >
          {{ t('auth.registerButton') }}
        </Button>
      </div>
    </form>

    <AuthFormFooter>
      {{ t('auth.hasAccount') }}
      <router-link
        to="/login"
        class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
      >
        {{ t('auth.signInLink') }}
      </router-link>
    </AuthFormFooter>
  </div>
</template>
