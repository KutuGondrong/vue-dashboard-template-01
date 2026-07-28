<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { NavMenuDrawer, type NavMenuItem } from '@/components/NavMenu';
import { useSidebarStore } from '@/layouts/sidebar/stores/sidebarStore';

defineProps<{ isOpen: boolean }>();

const emit = defineEmits<{ close: [] }>();

const sidebarStore = useSidebarStore();
const { menuItems } = storeToRefs(sidebarStore);

const navItems = computed(() => menuItems.value as NavMenuItem[]);
</script>

<template>
  <NavMenuDrawer
    :is-open="isOpen"
    :items="navItems"
    :initial-open-keys="['documentation', 'components']"
    @close="emit('close')"
  />
</template>
