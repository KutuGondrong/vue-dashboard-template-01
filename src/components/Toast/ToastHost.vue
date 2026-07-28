<script setup lang="ts">
import { storeToRefs } from 'pinia';
import ToastItem from './ToastItem.vue';
import { TOAST_POSITIONS, TOAST_POSITION_CLASSES } from './toastPositions';
import { useToastStore } from './stores/toastStore';

const toastStore = useToastStore();
const { toastsByPosition } = storeToRefs(toastStore);
const { dismissToast } = toastStore;
</script>

<template>
  <slot />
  <template
    v-for="pos in TOAST_POSITIONS"
    :key="pos"
  >
    <div
      v-if="(toastsByPosition.get(pos) ?? []).length > 0"
      aria-live="polite"
      :class="TOAST_POSITION_CLASSES[pos]"
    >
      <ToastItem
        v-for="toast in toastsByPosition.get(pos) ?? []"
        :key="toast.id"
        :toast="toast"
        @dismiss="dismissToast"
      />
    </div>
  </template>
</template>
