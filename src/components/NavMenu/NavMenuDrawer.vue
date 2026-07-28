<script setup lang="ts">
import { useLocale } from '@/locales/localeStore';
import NavMenu from './NavMenu.vue';
import type { NavMenuItem } from './navMenu.types';

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    items: NavMenuItem[];
    /** Drawer header title. Defaults to common “menu” locale string. */
    title?: string;
    class?: string;
    initialOpenKeys?: string[];
  }>(),
  {
    initialOpenKeys: () => [],
  },
);

const emit = defineEmits<{ close: [] }>();

const { t } = useLocale();
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 lg:hidden"
    >
      <div
        class="absolute inset-0 animate-drawer-backdrop bg-black/50"
        aria-hidden="true"
        @click="emit('close')"
      />
      <aside
        id="mobile-nav-drawer"
        class="absolute left-0 top-0 flex h-full w-72 max-w-[85vw] animate-drawer-enter-left flex-col border-r border-stone-200 bg-white shadow-xl dark:border-surface-600 dark:bg-surface-900"
      >
        <div
          class="flex h-14 shrink-0 items-center justify-between border-b border-stone-200 px-4 dark:border-surface-600"
        >
          <h2 class="text-sm font-semibold text-stone-900 dark:text-white">
            {{ title ?? t('components.common.menu') }}
          </h2>
          <button
            type="button"
            class="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-surface-700"
            :aria-label="t('components.common.dismiss')"
            @click="emit('close')"
          >
            <svg
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <NavMenu
          :items="items"
          :collapsible="false"
          embedded
          :manage-width="false"
          child-connector="tree"
          children-mode="collapsible"
          :initial-open-keys="initialOpenKeys"
          scroll-controls="all"
          scroll-controls-variant="bar"
          class="min-h-0 flex-1 px-3 py-3"
          :class="props.class"
          @dismiss="emit('close')"
        />
      </aside>
    </div>
  </Teleport>
</template>
