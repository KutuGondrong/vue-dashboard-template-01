import { defineStore } from 'pinia';
import { ref, shallowRef, type VNode } from 'vue';
import type { ConfirmOptions, ShowModalOptions } from '@/components/Modal/modalTypes';

type ModalState =
  | { type: 'confirm'; options: ConfirmOptions }
  | { type: 'custom'; options: ShowModalOptions }
  | null;

export const useModalStore = defineStore('modal', () => {
  const state = ref<ModalState>(null);
  const resolveRef = shallowRef<((value: boolean) => void) | null>(null);
  const customContent = shallowRef<VNode | VNode[] | null>(null);
  const customFooter = shallowRef<VNode | VNode[] | null>(null);

  function close(): void {
    resolveRef.value?.(false);
    resolveRef.value = null;
    state.value = null;
    customContent.value = null;
    customFooter.value = null;
  }

  function confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      resolveRef.value = resolve;
      state.value = { type: 'confirm', options };
    });
  }

  function show(options: ShowModalOptions): void {
    resolveRef.value = null;
    customContent.value = options.children;
    customFooter.value = options.footer ?? null;
    state.value = { type: 'custom', options };
  }

  function handleConfirm(): void {
    resolveRef.value?.(true);
    resolveRef.value = null;
    state.value = null;
  }

  return {
    state,
    resolveRef,
    customContent,
    customFooter,
    close,
    confirm,
    show,
    handleConfirm,
  };
});
