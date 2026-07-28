<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useLocale } from '@/locales/localeStore';
import { assetUrl } from '@/config/basePath';
import { Button } from '@/components/Button';

export type FileDownloadDemoState = 'none' | 'downloading' | 'success' | 'error';

/** Values `onDownload` may return so FileDownload can save/open the file. */
export type FileDownloadResult =
  | void
  | Blob
  | ArrayBuffer
  | Uint8Array
  | { data: Blob | ArrayBuffer | Uint8Array | string }
  | { url: string };

export type FileDownloadHandler = () => FileDownloadResult | Promise<FileDownloadResult>;

interface FileDownloadProps {
  /** Display + download name. Optional when `url` + `metadataFromUrl`. */
  filename?: string;
  url?: string;
  /** Human-readable size label. Optional when `url` + `metadataFromUrl`. */
  size?: string;
  /**
   * Resolve filename from the URL path and size from the file (HEAD/GET).
   * Useful for static links so you do not set name/size by hand.
   */
  metadataFromUrl?: boolean;
  onDownload?: FileDownloadHandler;
  demoState?: FileDownloadDemoState;
  demoErrorMessage?: string;
  class?: string;
}

const props = withDefaults(defineProps<FileDownloadProps>(), {
  demoState: 'none',
  metadataFromUrl: false,
  class: '',
});

const { t } = useLocale();
const liveState = ref<'idle' | 'downloading' | 'error'>('idle');
const liveError = ref<string | undefined>();
const derivedFilename = ref('');
const derivedSize = ref<string | undefined>();
const metadataLoading = ref(false);

const isSnapshot = computed(() => props.demoState !== 'none');
const isDownloading = computed(() =>
  isSnapshot.value ? props.demoState === 'downloading' : liveState.value === 'downloading',
);
const isError = computed(() =>
  isSnapshot.value ? props.demoState === 'error' : liveState.value === 'error',
);
const defaultError = t('components.common.fileDownload.error');
const errorMessage = computed(() =>
  isSnapshot.value
    ? (props.demoErrorMessage ?? t('components.common.fileDownload.failed'))
    : (liveError.value ?? defaultError),
);

const shouldDeriveMetadata = computed(() => Boolean(props.metadataFromUrl && props.url));

/** Public `/…` paths must respect Vite `base` (e.g. `/vue-dashboard-template-01/`). */
function resolveFileUrl(url: string): string {
  if (!url) return url;
  if (/^(https?:|blob:|data:)/i.test(url)) return url;
  const base = import.meta.env.BASE_URL || '/';
  if (url.startsWith('/') && base !== '/' && !url.startsWith(base)) {
    return assetUrl(url);
  }
  if (!url.startsWith('/')) {
    return assetUrl(url);
  }
  return url;
}

const resolvedFileUrl = computed(() => (props.url ? resolveFileUrl(props.url) : undefined));

const resolvedFilename = computed(() => {
  if (shouldDeriveMetadata.value && derivedFilename.value) return derivedFilename.value;
  if (props.filename) return props.filename;
  if (props.url) return filenameFromUrl(props.url);
  return 'download';
});

const resolvedSize = computed(() => {
  if (shouldDeriveMetadata.value) {
    if (metadataLoading.value) return '…';
    return derivedSize.value;
  }
  return props.size;
});

const borderClass = computed(() =>
  isError.value
    ? 'border-red-300 dark:border-red-800'
    : isDownloading.value
      ? 'border-primary-300 dark:border-primary-700'
      : 'border-stone-200 dark:border-surface-600',
);

const subtitle = computed(() =>
  isDownloading.value
    ? t('components.common.fileDownload.downloading')
    : isError.value
      ? errorMessage.value
      : resolvedSize.value,
);

const subtitleClass = computed(() =>
  isError.value ? 'text-xs text-red-600 dark:text-red-400' : 'text-xs text-stone-500',
);

function filenameFromUrl(url: string): string {
  try {
    const path = new URL(url, 'http://local.invalid').pathname;
    const base = path.split('/').filter(Boolean).pop();
    return base ? decodeURIComponent(base) : 'download';
  } catch {
    return 'download';
  }
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = -1;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  const rounded = value >= 10 || unitIndex < 0 ? value.toFixed(0) : value.toFixed(1);
  return unitIndex < 0 ? `${bytes} B` : `${rounded} ${units[unitIndex]}`;
}

async function resolveMetadataFromUrl(url: string) {
  const fetchUrl = resolveFileUrl(url);
  derivedFilename.value = filenameFromUrl(url);
  derivedSize.value = undefined;
  metadataLoading.value = true;
  try {
    // Prefer GET: some static servers omit Content-Length on HEAD.
    const response = await fetch(fetchUrl);
    if (!response.ok) return;
    const lengthHeader = response.headers.get('content-length');
    if (lengthHeader && Number(lengthHeader) > 0) {
      derivedSize.value = formatBytes(Number(lengthHeader));
      return;
    }
    const blob = await response.blob();
    if (blob.size > 0) {
      derivedSize.value = formatBytes(blob.size);
    }
  } catch {
    derivedSize.value = undefined;
  } finally {
    metadataLoading.value = false;
  }
}

watch(
  () => [props.metadataFromUrl, props.url] as const,
  ([fromUrl, url]) => {
    if (!fromUrl || !url) {
      derivedFilename.value = '';
      derivedSize.value = undefined;
      metadataLoading.value = false;
      return;
    }
    void resolveMetadataFromUrl(url);
  },
  { immediate: true },
);

function toBlob(data: Blob | ArrayBuffer | Uint8Array | string): Blob {
  if (data instanceof Blob) return data;
  if (typeof data === 'string') return new Blob([data], { type: 'text/plain' });
  return new Blob([data], { type: 'application/octet-stream' });
}

function triggerBrowserDownload(href: string, revokeObjectUrl = false) {
  const link = document.createElement('a');
  link.href = href;
  link.download = resolvedFilename.value;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  if (revokeObjectUrl) {
    URL.revokeObjectURL(href);
  }
}

function saveDownloadResult(result: FileDownloadResult) {
  if (result == null) return;

  if (result instanceof Blob) {
    const objectUrl = URL.createObjectURL(result);
    triggerBrowserDownload(objectUrl, true);
    return;
  }

  if (result instanceof ArrayBuffer || result instanceof Uint8Array) {
    const objectUrl = URL.createObjectURL(toBlob(result));
    triggerBrowserDownload(objectUrl, true);
    return;
  }

  if (typeof result === 'object' && 'url' in result && typeof result.url === 'string') {
    triggerBrowserDownload(resolveFileUrl(result.url));
    return;
  }

  if (typeof result === 'object' && 'data' in result) {
    const objectUrl = URL.createObjectURL(toBlob(result.data));
    triggerBrowserDownload(objectUrl, true);
  }
}

async function runDownload() {
  if (props.onDownload) {
    const result = await props.onDownload();
    saveDownloadResult(result);
    return;
  }

  if (resolvedFileUrl.value) {
    triggerBrowserDownload(resolvedFileUrl.value);
  }
}

async function handleDownload() {
  if (isSnapshot.value) {
    await runDownload();
    return;
  }

  if (!props.onDownload && !resolvedFileUrl.value) return;

  liveState.value = 'downloading';
  liveError.value = undefined;
  try {
    await runDownload();
    liveState.value = 'idle';
  } catch {
    liveError.value = defaultError;
    liveState.value = 'error';
  }
}
</script>

<template>
  <div
    :class="[
      'flex w-full min-w-0 max-w-sm items-center gap-3 rounded-lg border bg-white p-4 dark:bg-surface-800',
      borderClass,
      isError && 'opacity-80',
      props.class,
    ]"
  >
    <div class="flex min-w-0 flex-1 items-center gap-3">
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30"
      >
        <svg
          class="h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-stone-900 dark:text-white">
          {{ resolvedFilename }}
        </p>
        <p
          v-if="subtitle"
          :class="['truncate', subtitleClass]"
        >
          {{ subtitle }}
        </p>
      </div>
    </div>
    <div
      v-if="isDownloading"
      class="ml-1 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600"
      role="status"
      :aria-label="t('components.common.fileDownload.downloading')"
    />
    <Button
      v-else
      variant="outline"
      size="sm"
      class="ml-1 shrink-0"
      @click="handleDownload"
    >
      {{ t('components.common.download') }}
    </Button>
  </div>
</template>
