<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { NavMenu, type NavMenuItem } from '@/components/NavMenu';
import { useSidebarStore } from '@/layouts/sidebar/stores/sidebarStore';

const props = withDefaults(
  defineProps<{
    collapsed?: boolean;
    collapsible?: boolean;
    class?: string;
  }>(),
  {
    collapsed: false,
    collapsible: true,
  },
);

const emit = defineEmits<{ collapse: [collapsed: boolean] }>();

const sidebarStore = useSidebarStore();
const { menuItems } = storeToRefs(sidebarStore);

const navItems = computed(() => menuItems.value as NavMenuItem[]);
</script>

<template>
  <NavMenu
    :items="navItems"
    :collapsed="collapsed"
    :collapsible="collapsible"
    collapse-trigger-position="centerPeeking"
    collapse-label-variant="sidebar"
    :manage-width="false"
    child-connector="tree"
    children-mode="collapsible"
    :initial-open-keys="['documentation', 'components']"
    scroll-controls="all"
    scroll-controls-variant="bar"
    class="h-full min-h-0"
    :class="props.class"
    @collapse="emit('collapse', $event)"
  />
</template>
