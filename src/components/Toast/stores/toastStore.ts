import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { localSource } from '@/datasource/local/localSource';
import type { ToastMessage, ToastPosition } from '@/models/model.type';
import { DEFAULT_TOAST_POSITION, TOAST_POSITIONS } from '@/components/Toast/toastPositions';

function generateId(): string {
  return `toast_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<ToastMessage[]>([]);
  const position = ref<ToastPosition>(localSource.getToastPosition() ?? DEFAULT_TOAST_POSITION);

  function setPosition(newPosition: ToastPosition): void {
    position.value = newPosition;
    localSource.setToastPosition(newPosition);
  }

  function dismissToast(id: string): void {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  function showToast(toast: Omit<ToastMessage, 'id'>): void {
    const id = generateId();
    const duration =
      toast.duration !== undefined ? toast.duration : toast.type === 'processing' ? 0 : 5000;

    toasts.value = [...toasts.value, { ...toast, id }];

    if (duration > 0) {
      setTimeout(() => dismissToast(id), duration);
    }
  }

  const toastsByPosition = computed(() => {
    const grouped = new Map<ToastPosition, ToastMessage[]>();

    for (const pos of TOAST_POSITIONS) {
      grouped.set(pos, []);
    }

    for (const toast of toasts.value) {
      const toastPosition = toast.position ?? position.value;
      grouped.get(toastPosition)?.push(toast);
    }

    return grouped;
  });

  return {
    toasts,
    position,
    setPosition,
    showToast,
    dismissToast,
    toastsByPosition,
  };
});
