<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { RouteLocationNormalized } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthFormStore } from '@/features/auth/stores/authFormStore';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useLocale } from '@/locales/localeStore';
import AuthFormFooter from '@/features/auth/components/AuthFormFooter.vue';
import AuthFormHeader from '@/features/auth/components/AuthFormHeader.vue';
import { createValidationRules, Input, ValidateOn } from '@/components/Input';
import { Button } from '@/components/Button';

const { t } = useLocale();
const authFormStore = useAuthFormStore();
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const { errors } = storeToRefs(authFormStore);
const { isLoading } = storeToRefs(authStore);

const email = ref('');
const password = ref('');

onMounted(() => authFormStore.setMode('login'));

const onSubmit = async () => {
  await authFormStore.submitLogin(
    { email: email.value, password: password.value },
    (route.redirectedFrom ?? null) as RouteLocationNormalized | null,
    (path) => router.replace(path),
  );
};
</script>

<template>
  <div class="w-full">
    <AuthFormHeader
      :title="t('auth.loginTitle')"
      :subtitle="t('auth.loginSubtitle')"
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
        autocomplete="current-password"
        @update:model-value="authFormStore.clearFieldError('password')"
      />

      <div class="pt-1">
        <Button
          type="submit"
          full-width
          :is-loading="isLoading"
        >
          {{ t('auth.loginButton') }}
        </Button>
      </div>
    </form>

    <AuthFormFooter>
      {{ t('auth.noAccount') }}
      <router-link
        to="/register"
        class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
      >
        {{ t('auth.signUpLink') }}
      </router-link>
    </AuthFormFooter>

    <div
      class="mt-6 rounded-lg border border-dashed border-stone-200 bg-stone-50 px-4 py-3 text-center text-xs text-stone-500 dark:border-surface-600 dark:bg-surface-700/50 dark:text-stone-400"
    >
      <p class="font-medium text-stone-600 dark:text-stone-300">
        {{ t('auth.demoCredentialsTitle') }}
      </p>
      <p class="mt-1 font-mono text-[11px] tracking-wide">
        {{ t('auth.demoCredentialsHint') }}
      </p>
    </div>
  </div>
</template>
