import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getRouter } from '@/core/router/routerBridge';
import { localSource } from '@/datasource/local/localSource';
import { setUnauthorizedHandler } from '@/datasource/network/services/backendService';
import { authUsecase } from '@/features/auth/usecase/authUsecase';
import type { AuthSession, LoginCredentials, RegisterCredentials, User } from '@/models/model.type';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(localSource.getUser());
  const token = ref<string | null>(localSource.getToken());
  const isLoading = ref(false);
  const isBootstrapping = ref(false);

  const isAuthenticated = computed(() => !!token.value && !!user.value);

  function clearSession(): void {
    localSource.clearAuth();
    user.value = null;
    token.value = null;
  }

  function persistSession(session: AuthSession): void {
    localSource.setToken(session.token);
    localSource.setUser(session.user);
    token.value = session.token;
    user.value = session.user;
  }

  async function login(credentials: LoginCredentials): Promise<void> {
    isLoading.value = true;
    try {
      const session = await authUsecase.login(credentials);
      persistSession(session);
    } finally {
      isLoading.value = false;
    }
  }

  async function register(credentials: RegisterCredentials): Promise<void> {
    isLoading.value = true;
    try {
      const session = await authUsecase.register(credentials);
      persistSession(session);
    } finally {
      isLoading.value = false;
    }
  }

  async function logout(): Promise<void> {
    isLoading.value = true;
    try {
      await authUsecase.logout();
    } finally {
      clearSession();
      isLoading.value = false;
      await getRouter().push('/login');
    }
  }

  function handleUnauthorized(): void {
    clearSession();
    const router = getRouter();
    void router.replace({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath },
    });
  }

  function initAuth(): () => void {
    setUnauthorizedHandler(handleUnauthorized);

    const listener = (): void => handleUnauthorized();
    window.addEventListener('auth:unauthorized', listener);

    return () => {
      window.removeEventListener('auth:unauthorized', listener);
    };
  }

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    isBootstrapping,
    login,
    register,
    logout,
    clearSession,
    initAuth,
  };
});
