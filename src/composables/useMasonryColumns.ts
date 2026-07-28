import { ref, onMounted, onUnmounted, type Ref } from 'vue';

function resolveColumns(width: number): number {
  if (width < 640) return 1;
  if (width < 1024) return 2;
  return 3;
}

export function useMasonryColumns(): Ref<number> {
  const columns = ref(typeof window !== 'undefined' ? resolveColumns(window.innerWidth) : 3);

  function onResize(): void {
    columns.value = resolveColumns(window.innerWidth);
  }

  onMounted(() => {
    onResize();
    window.addEventListener('resize', onResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', onResize);
  });

  return columns;
}
