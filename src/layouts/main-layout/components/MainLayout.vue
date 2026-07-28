<script setup lang="ts">
import { ref, watch } from 'vue';
import Header from '@/layouts/header/components/Header.vue';
import Sidebar from '@/layouts/sidebar/components/Sidebar.vue';
import MobileNavDrawer from '@/layouts/sidebar/components/MobileNavDrawer.vue';
import Footer from '@/layouts/footer/components/Footer.vue';
import { ScrollContainer } from '@/components/ScrollToTop';
import ScrollProvider from '@/layouts/main-layout/components/ScrollProvider.vue';
import { layoutSurfaces } from '@/layouts/main-layout/layoutSurfaces';
import { useLayoutStore } from '@/layouts/main-layout/stores/layoutStore';
import { storeToRefs } from 'pinia';

const layoutStore = useLayoutStore();
const { sidebarCollapsed, mobileNavOpen } = storeToRefs(layoutStore);

const siderWidth = ref('256px');

watch(
  () => sidebarCollapsed.value,
  (collapsed) => {
    siderWidth.value = collapsed ? '72px' : '256px';
  },
  { immediate: true },
);
</script>

<template>
  <ScrollProvider>
    <div
      :class="[
        'relative flex h-screen min-h-0 flex-col overflow-hidden rounded-none border-0',
        layoutSurfaces.canvas,
      ]"
    >
      <div
        class="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div class="absolute inset-0 bg-stone-50 dark:bg-surface-950" />
        <div
          class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.07),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.1),transparent_55%)]"
        />
      </div>

      <header
        :class="[
          'relative z-40 shrink-0 border-b border-stone-200 px-3 py-2.5 sm:px-4 sm:py-3 lg:px-6 dark:border-surface-600',
          '!border-0',
          layoutSurfaces.header,
        ]"
      >
        <Header
          :is-mobile-nav-open="mobileNavOpen"
          @menu-toggle="layoutStore.toggleMobileNav"
        />
      </header>

      <MobileNavDrawer
        :is-open="mobileNavOpen"
        @close="layoutStore.closeMobileNav"
      />

      <div class="relative flex min-h-0 flex-1 flex-row rounded-none border-0 bg-transparent">
        <aside
          :style="{ width: siderWidth }"
          :class="[
            'relative z-10 flex hidden h-full min-h-0 shrink-0 flex-col overflow-hidden border-stone-200 bg-stone-50 transition-[width] duration-200 lg:flex dark:border-surface-600',
            layoutSurfaces.nav,
            '!overflow-visible !border-0',
          ]"
        >
          <Sidebar
            :collapsed="sidebarCollapsed"
            @collapse="layoutStore.setSidebarCollapsed"
          />
        </aside>

        <ScrollContainer :class="['!p-0', layoutSurfaces.main]">
          <div class="flex h-full min-h-0 flex-col overflow-y-auto overflow-x-hidden">
            <div class="flex min-h-full flex-col">
              <div
                class="flex grow flex-col p-3 sm:p-4 lg:p-6"
                data-layout-page
              >
                <RouterView />
              </div>
              <footer
                :class="[
                  'border-t border-stone-200 bg-stone-50 px-3 py-3 text-xs text-stone-500 sm:px-4 sm:py-4 sm:text-left lg:px-6 dark:border-surface-600 dark:text-stone-400',
                  '!border-0',
                  layoutSurfaces.footer,
                ]"
              >
                <Footer />
              </footer>
            </div>
          </div>
        </ScrollContainer>
      </div>
    </div>
  </ScrollProvider>
</template>
