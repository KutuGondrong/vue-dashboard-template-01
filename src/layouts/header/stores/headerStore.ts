import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { getRouter } from '@/core/router/routerBridge';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useLocaleStore } from '@/locales/localeStore';
import { useThemeStore } from '@/core/stores/themeStore';

export const useHeaderStore = defineStore('header', () => {
  const authStore = useAuthStore();
  const localeStore = useLocaleStore();
  const themeStore = useThemeStore();

  const { user } = storeToRefs(authStore);
  const { locale } = storeToRefs(localeStore);
  const { resolvedTheme } = storeToRefs(themeStore);

  const isProfileOpen = ref(false);

  const isDark = computed(() => resolvedTheme.value === 'dark');

  function toggleProfile(): void {
    isProfileOpen.value = !isProfileOpen.value;
  }

  function closeProfile(): void {
    isProfileOpen.value = false;
  }

  function handleSettings(): void {
    closeProfile();
    void getRouter().push('/settings');
  }

  function handleLogout(): void {
    closeProfile();
    void authStore.logout();
  }

  return {
    user,
    locale,
    isProfileOpen,
    isDark,
    t: localeStore.t,
    setLocale: localeStore.setLocale,
    toggleTheme: themeStore.toggleTheme,
    toggleProfile,
    closeProfile,
    handleSettings,
    handleLogout,
  };
});
