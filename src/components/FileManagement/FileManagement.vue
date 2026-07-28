<script setup lang="ts">
import { computed, ref, useId } from 'vue';
import { appConfig } from '@/config/app.config';
import { useLocale } from '@/locales/localeStore';
import type { FileUploadItem } from '@/models/model.type';

type FileUploadHandler = (
  item: FileUploadItem,
  onProgress: (progress: number) => void,
) => Promise<void>;

interface FileUploadMessages {
  dragDrop?: string;
  dropHere?: string;
  maxSize?: string;
  pending?: string;
  uploading?: string;
  success?: string;
  error?: string;
  fileTooLarge?: string;
  removeFile?: string;
  disabled?: string;
}

type FileUploadDemoState = 'none' | 'pending' | 'uploading' | 'success' | 'error';

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
  disabled?: boolean;
  demoState?: FileUploadDemoState;
  demoFileName?: string;
  demoProgress?: number;
  demoErrorMessage?: string;
  messages?: FileUploadMessages;
  onUpload?: FileUploadHandler;
  class?: string;
}

const props = withDefaults(defineProps<FileUploadProps>(), {
  multiple: false,
  maxSizeMb: appConfig.maxFileSizeMb,
  disabled: false,
  demoState: 'none',
  demoFileName: 'document.pdf',
  demoProgress: 65,
  class: '',
});

const emit = defineEmits<{
  filesSelected: [files: FileUploadItem[]];
  uploadSuccess: [item: FileUploadItem];
  uploadError: [item: FileUploadItem, error: string];
}>();

const { t } = useLocale();
const inputId = useId();
const inputRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const items = ref<FileUploadItem[]>([]);

const labels = computed(() => ({
  dragDrop: props.messages?.dragDrop ?? t('components.common.fileUpload.dragDrop'),
  dropHere: props.messages?.dropHere ?? t('components.common.fileUpload.dropHere'),
  maxSize:
    props.messages?.maxSize ?? t('components.common.fileUpload.maxSize', { size: props.maxSizeMb }),
  pending: props.messages?.pending ?? t('components.common.fileUpload.pending'),
  success: props.messages?.success ?? t('components.common.fileUpload.success'),
  error: props.messages?.error ?? t('components.common.fileUpload.error'),
  fileTooLarge:
    props.messages?.fileTooLarge ??
    t('components.common.fileUpload.fileTooLarge', { size: props.maxSizeMb }),
  removeFile: props.messages?.removeFile ?? t('components.common.fileUpload.removeFile'),
  disabled: props.messages?.disabled ?? t('components.common.fileUpload.disabled'),
}));

const maxBytes = computed(() => props.maxSizeMb * 1024 * 1024);

function generateId(): string {
  return `file_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function createDemoFile(name: string): File {
  return new File(['demo'], name, { type: 'application/pdf' });
}

function createDemoItem(
  demoState: Exclude<FileUploadDemoState, 'none'>,
  demoFileName: string,
  demoProgress: number,
  demoErrorMessage: string | undefined,
  defaultError: string,
): FileUploadItem {
  const base: FileUploadItem = {
    id: 'demo-file',
    file: createDemoFile(demoFileName),
    progress: demoState === 'success' ? 100 : demoProgress,
    status: demoState === 'uploading' ? 'uploading' : demoState,
  };

  if (demoState === 'error') {
    return { ...base, error: demoErrorMessage ?? defaultError };
  }

  return base;
}

const displayItems = computed(() => {
  if (props.demoState !== 'none') {
    return [
      createDemoItem(
        props.demoState,
        props.demoFileName,
        props.demoProgress,
        props.demoErrorMessage,
        labels.value.error,
      ),
    ];
  }
  return items.value;
});

function itemBorderClass(status: FileUploadItem['status']): string {
  switch (status) {
    case 'uploading':
      return 'border-primary-300 dark:border-primary-700';
    case 'success':
      return 'border-green-300 dark:border-green-800';
    case 'error':
      return 'border-red-300 dark:border-red-800';
    default:
      return 'border-stone-200 dark:border-surface-600';
  }
}

function statusBadgeClass(status: FileUploadItem['status']): string {
  switch (status) {
    case 'uploading':
      return 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300';
    case 'success':
      return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
    case 'error':
      return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
    default:
      return 'bg-stone-100 text-stone-600 dark:bg-surface-600 dark:text-stone-300';
  }
}

function getStatusLabel(item: FileUploadItem): string {
  switch (item.status) {
    case 'uploading':
      return (
        props.messages?.uploading?.replace('{{progress}}', String(item.progress)) ??
        t('components.common.fileUpload.uploading', { progress: item.progress })
      );
    case 'success':
      return labels.value.success;
    case 'error':
      return item.error ?? labels.value.error;
    case 'pending':
      return labels.value.pending;
    default:
      return labels.value.pending;
  }
}

async function startUpload(item: FileUploadItem) {
  if (!props.onUpload) return;

  items.value = items.value.map((i) =>
    i.id === item.id ? { ...i, status: 'uploading' as const, progress: 0 } : i,
  );

  try {
    await props.onUpload(item, (progress) => {
      items.value = items.value.map((i) =>
        i.id === item.id ? { ...i, progress, status: 'uploading' as const } : i,
      );
    });

    items.value = items.value.map((i) =>
      i.id === item.id ? { ...i, status: 'success' as const, progress: 100 } : i,
    );
    emit('uploadSuccess', item);
  } catch {
    const errorMessage = labels.value.error;
    items.value = items.value.map((i) =>
      i.id === item.id ? { ...i, status: 'error' as const, error: errorMessage } : i,
    );
    emit('uploadError', item, errorMessage);
  }
}

function processFiles(fileList: FileList) {
  if (props.disabled || props.demoState !== 'none') return;

  const newItems: FileUploadItem[] = [];

  Array.from(fileList).forEach((file) => {
    if (file.size > maxBytes.value) {
      newItems.push({
        id: generateId(),
        file,
        progress: 0,
        status: 'error',
        error: labels.value.fileTooLarge,
      });
    } else {
      newItems.push({
        id: generateId(),
        file,
        progress: 0,
        status: 'pending',
      });
    }
  });

  items.value = [...items.value, ...newItems];
  emit('filesSelected', newItems);

  if (props.onUpload) {
    newItems
      .filter((item) => item.status === 'pending')
      .forEach((item) => {
        void startUpload(item);
      });
  }
}

function handleDragOver(e: DragEvent) {
  e.preventDefault();
  if (!props.disabled) isDragging.value = true;
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault();
  isDragging.value = false;
}

function handleDrop(e: DragEvent) {
  e.preventDefault();
  isDragging.value = false;
  if (!props.disabled && e.dataTransfer?.files.length) {
    processFiles(e.dataTransfer.files);
  }
}

function removeItem(id: string) {
  if (props.demoState !== 'none') return;
  items.value = items.value.filter((item) => item.id !== id);
}

const dropZoneText = computed(() =>
  isDragging.value ? labels.value.dropHere : labels.value.dragDrop,
);
</script>

<template>
  <div :class="props.class">
    <div
      role="button"
      :tabindex="disabled ? -1 : 0"
      :aria-disabled="disabled"
      :class="[
        'rounded-xl border-2 border-dashed p-8 text-center transition-colors',
        disabled
          ? 'cursor-not-allowed border-stone-200 opacity-50 dark:border-surface-600'
          : isDragging
            ? 'cursor-pointer border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'cursor-pointer border-stone-300 hover:border-primary-400 dark:border-surface-500 dark:hover:border-primary-500',
      ]"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @click="!disabled && inputRef?.click()"
      @keydown="
        (e) => {
          if (disabled) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef?.click();
          }
        }
      "
    >
      <input
        :id="inputId"
        ref="inputRef"
        type="file"
        :accept="accept"
        :multiple="multiple"
        :disabled="disabled"
        class="hidden"
        @change="
          (e) => {
            const target = e.target as HTMLInputElement;
            if (target.files) processFiles(target.files);
            target.value = '';
          }
        "
      >
      <svg
        class="mx-auto mb-3 h-10 w-10 text-stone-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
      <p class="text-sm text-stone-600 dark:text-stone-400">
        {{ disabled ? labels.disabled : dropZoneText }}
      </p>
      <p
        v-if="!disabled"
        class="mt-1 text-xs text-stone-400"
      >
        {{ labels.maxSize }}
      </p>
    </div>

    <ul
      v-if="displayItems.length > 0"
      class="mt-4 space-y-2"
    >
      <li
        v-for="item in displayItems"
        :key="item.id"
        :class="[
          'flex items-center gap-3 rounded-lg border bg-white p-3 dark:bg-surface-800',
          itemBorderClass(item.status),
        ]"
      >
        <svg
          v-if="item.status === 'uploading'"
          class="h-5 w-5 animate-spin text-primary-500"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <svg
          v-else-if="item.status === 'success'"
          class="h-5 w-5 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <svg
          v-else-if="item.status === 'error'"
          class="h-5 w-5 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        <svg
          v-else
          class="h-5 w-5 text-stone-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <p class="truncate text-sm font-medium text-stone-900 dark:text-white">
              {{ item.file.name }}
            </p>
            <span
              :class="[
                'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                statusBadgeClass(item.status),
              ]"
            >
              {{ getStatusLabel(item) }}
            </span>
          </div>
          <p class="text-xs text-stone-500">
            {{ formatFileSize(item.file.size) }}
          </p>
          <div
            v-if="item.status === 'uploading'"
            class="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-surface-600"
          >
            <div
              class="h-full rounded-full bg-primary-500 transition-all duration-200"
              :style="{ width: `${item.progress}%` }"
            />
          </div>
          <p
            v-if="item.status === 'error' && item.error"
            class="mt-1 text-xs text-red-600 dark:text-red-400"
          >
            {{ item.error }}
          </p>
        </div>
        <button
          type="button"
          class="shrink-0 text-stone-400 hover:text-red-500"
          :aria-label="labels.removeFile"
          @click="removeItem(item.id)"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </li>
    </ul>
  </div>
</template>
