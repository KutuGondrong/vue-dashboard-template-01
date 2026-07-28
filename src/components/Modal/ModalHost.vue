<script setup lang="ts">
import { storeToRefs } from 'pinia';
import Modal from './Modal.vue';
import ConfirmDialog from './ConfirmDialog.vue';
import RenderVNodes from './RenderVNodes.vue';
import { useModalStore } from './stores/modalStore';

const modalStore = useModalStore();
const { state, customContent, customFooter } = storeToRefs(modalStore);
const { close, handleConfirm } = modalStore;
</script>

<template>
  <slot />

  <ConfirmDialog
    v-if="state?.type === 'confirm'"
    :is-open="true"
    :title="state.options.title"
    :message="state.options.message"
    :confirm-label="state.options.confirmLabel"
    :cancel-label="state.options.cancelLabel"
    :variant="state.options.variant"
    @close="close"
    @confirm="handleConfirm"
  />

  <Modal
    v-if="state?.type === 'custom'"
    :is-open="true"
    :title="state.options.title"
    :description="state.options.description"
    :size="state.options.size"
    :close-on-backdrop-click="state.options.closeOnBackdropClick"
    @close="close"
  >
    <RenderVNodes
      v-if="customContent"
      :vnodes="customContent"
    />

    <template
      v-if="customFooter"
      #footer
    >
      <RenderVNodes :vnodes="customFooter" />
    </template>
  </Modal>
</template>
