<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useHeaderStore } from '@/layouts/header/stores/headerStore';
import HeaderLogo from '@/layouts/header/components/HeaderLogo.vue';
import MobileMenuButton from '@/layouts/header/components/MobileMenuButton.vue';
import LocaleToggle from '@/layouts/header/components/LocaleToggle.vue';
import ThemeToggleButton from '@/layouts/header/components/ThemeToggleButton.vue';
import ProfileMenu from '@/layouts/header/components/ProfileMenu.vue';

defineProps<{
  isMobileNavOpen?: boolean;
}>();

const emit = defineEmits<{ menuToggle: [] }>();

const headerStore = useHeaderStore();
const { user, locale, isProfileOpen, isDark } = storeToRefs(headerStore);
const { t, setLocale, toggleTheme, toggleProfile, handleSettings, handleLogout } = headerStore;
</script>

<template>
  <div class="flex min-h-14 w-full items-center justify-between gap-2">
    <div class="flex min-w-0 flex-1 items-center gap-1 lg:gap-2">
      <MobileMenuButton
        :is-open="isMobileNavOpen ?? false"
        :label="t('components.common.openMenu')"
        @click="emit('menuToggle')"
      />
      <HeaderLogo />
    </div>

    <div class="flex shrink-0 items-center gap-2">
      <div class="hidden items-center gap-2 lg:flex">
        <LocaleToggle
          :locale="locale"
          :show-labels="true"
          @change="setLocale"
        />
        <ThemeToggleButton
          :is-dark="isDark"
          :label="isDark ? t('components.common.lightMode') : t('components.common.darkMode')"
          @toggle="toggleTheme"
        />
      </div>

      <ProfileMenu
        v-if="user"
        :user="user"
        :is-open="isProfileOpen"
        :settings-label="t('components.common.settings')"
        :logout-label="t('components.common.logout')"
        @toggle="toggleProfile"
        @settings="handleSettings"
        @logout="handleLogout"
      />
    </div>
  </div>
</template>
