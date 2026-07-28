import { ref, type Ref } from 'vue';

export function createHotMessageBag<T>(initial: T): {
  readonly current: T;
  readonly revision: Ref<number>;
  replace(next: T): void;
} {
  let current = initial;
  const revision = ref(0);

  return {
    get current() {
      return current;
    },
    revision,
    replace(next: T) {
      current = next;
      revision.value += 1;
    },
  };
}

export function registerJsonLocaleHmr(
  jsonPaths: string[],
  reload: () => Promise<void> | void,
): void {
  if (!import.meta.hot || jsonPaths.length === 0) return;

  import.meta.hot.accept(jsonPaths, async () => {
    await reload();
  });
}
