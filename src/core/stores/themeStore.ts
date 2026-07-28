import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { localSource } from '@/datasource/local/localSource';
import type { ThemeMode } from '@/models/model.type';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') return getSystemTheme();
  return mode;
}

function applyThemeClass(theme: 'light' | 'dark'): void {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>(localSource.getTheme() ?? 'system');
  const resolvedTheme = ref<'light' | 'dark'>(resolveTheme(mode.value));

  function applyTheme(theme: 'light' | 'dark'): void {
    applyThemeClass(theme);
    resolvedTheme.value = theme;
  }

  function setMode(newMode: ThemeMode): void {
    mode.value = newMode;
    localSource.setTheme(newMode);
    applyTheme(resolveTheme(newMode));
  }

  function toggleTheme(): void {
    const next = resolvedTheme.value === 'light' ? 'dark' : 'light';
    setMode(next);
  }

  function initTheme(): () => void {
    applyTheme(resolveTheme(mode.value));

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (): void => {
      if (mode.value === 'system') {
        applyTheme(getSystemTheme());
      }
    };
    mediaQuery.addEventListener('change', handler);

    watch(mode, (newMode) => {
      applyTheme(resolveTheme(newMode));
    });

    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }

  return {
    mode,
    resolvedTheme,
    setMode,
    toggleTheme,
    initTheme,
  };
});
