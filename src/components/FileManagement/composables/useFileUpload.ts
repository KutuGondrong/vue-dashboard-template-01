import { ref, computed } from 'vue';
import type { FileUploadItem } from '@/models/model.type';
import type { FileUploadHandler } from '@/components/FileManagement';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface UseFileUploadOptions {
  /** Demo: gagal upload jika nama file mengandung "error" */
  failOnErrorFilename?: boolean;
}

/**
 * Contoh composable upload — simulasi API + progress.
 * Nanti bisa diganti ke use case → repository tanpa mengubah komponen FileUpload.
 */
export function useFileUpload(options: UseFileUploadOptions = {}) {
  const { failOnErrorFilename = true } = options;
  const isUploading = ref(false);

  const uploadFile: FileUploadHandler = async (item: FileUploadItem, onProgress) => {
    isUploading.value = true;

    try {
      const steps = 10;
      for (let step = 1; step <= steps; step += 1) {
        await delay(180);
        onProgress(Math.round((step / steps) * 90));
      }

      await delay(400);

      if (failOnErrorFilename && item.file.name.toLowerCase().includes('error')) {
        throw new Error('UPLOAD_FAILED');
      }

      onProgress(100);
    } finally {
      isUploading.value = false;
    }
  };

  return { uploadFile, isUploading: computed(() => isUploading.value) };
}
