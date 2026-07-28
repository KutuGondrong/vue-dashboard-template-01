export { default as FileUpload } from './FileUpload.vue';
export { default as FileDownload } from './FileDownload.vue';
export { useFileUpload } from './composables/useFileUpload';
export type { UseFileUploadOptions } from './composables/useFileUpload';
export type {
  FileDownloadDemoState,
  FileDownloadHandler,
  FileDownloadResult,
} from './FileDownload.vue';

export type FileUploadHandler = (
  item: import('@/models/model.type').FileUploadItem,
  onProgress: (percent: number) => void,
) => Promise<void>;

export type FileUploadDemoState = 'none' | 'pending' | 'uploading' | 'success' | 'error';
