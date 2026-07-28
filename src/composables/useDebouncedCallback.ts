import { ref, watch, onUnmounted } from 'vue';

export function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delayMs = 300,
): (...args: Parameters<T>) => void {
  const callbackRef = ref(callback);
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  watch(
    () => callback,
    (next) => {
      callbackRef.value = next;
    },
    { flush: 'sync' },
  );

  onUnmounted(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callbackRef.value(...args), delayMs);
  };
}
