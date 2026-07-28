const CHUNK_RELOAD_KEY = 'vite:chunk-reload';

export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  return (
    error.name === 'ChunkLoadError' ||
    message.includes('failed to fetch dynamically imported module') ||
    message.includes('error loading dynamically imported module') ||
    message.includes('importing a module script failed') ||
    message.includes('loading chunk')
  );
}

export async function loaderWithRetry<T>(loader: () => Promise<T>): Promise<T> {
  try {
    const result = await loader();
    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
    return result;
  } catch (error) {
    if (!isChunkLoadError(error)) {
      throw error;
    }

    const hasReloaded = sessionStorage.getItem(CHUNK_RELOAD_KEY);
    if (!hasReloaded) {
      sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
      window.location.reload();
      return new Promise(() => {});
    }

    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
    throw error;
  }
}
