import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLayoutStore = defineStore('layout', () => {
  const sidebarCollapsed = ref(false);
  const mobileNavOpen = ref(false);

  function setSidebarCollapsed(collapsed: boolean): void {
    sidebarCollapsed.value = collapsed;
  }

  function openMobileNav(): void {
    mobileNavOpen.value = true;
  }

  function closeMobileNav(): void {
    mobileNavOpen.value = false;
  }

  function toggleMobileNav(): void {
    mobileNavOpen.value = !mobileNavOpen.value;
  }

  return {
    sidebarCollapsed,
    mobileNavOpen,
    setSidebarCollapsed,
    openMobileNav,
    closeMobileNav,
    toggleMobileNav,
  };
});
