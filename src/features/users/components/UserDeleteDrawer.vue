<script setup lang="ts">
import { ref, watch } from 'vue';
import { useLocale } from '@/locales/localeStore';
import type { User } from '@/models/model.type';
import Drawer from '@/components/Drawer/Drawer.vue';
import { Button } from '@/components/Button';
import Input from '@/components/Input/Input.vue';
import Badge from '@/components/Badge/Badge.vue';
import ConfirmDialog from '@/components/Modal/ConfirmDialog.vue';

const props = defineProps<{
  isOpen: boolean;
  user: User | null;
}>();

const emit = defineEmits<{
  close: [];
  delete: [];
}>();

const { t } = useLocale();
const showDeleteConfirm = ref(false);

watch(
  () => props.isOpen,
  (isOpen) => {
    if (!isOpen) showDeleteConfirm.value = false;
  },
);

function handleDeleteConfirm() {
  emit('delete');
  showDeleteConfirm.value = false;
  emit('close');
}
</script>

<template>
  <Drawer
    :is-open="isOpen"
    :title="t('users.deleteTitle')"
    :description="t('users.deleteDescription')"
    size="md"
    @close="emit('close')"
  >
    <div class="space-y-5">
      <Input
        :label="t('components.common.name')"
        :model-value="user?.fullName ?? ''"
        readonly
        :debounce-seconds="0"
      />
      <Input
        :label="t('components.common.email')"
        type="email"
        :model-value="user?.email ?? ''"
        readonly
        :debounce-seconds="0"
      />
      <div>
        <p class="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
          {{ t('components.common.role') }}
        </p>
        <Badge
          v-if="user"
          :variant="
            user.role === 'admin' ? 'primary' : user.role === 'moderator' ? 'info' : 'default'
          "
        >
          {{ user.role }}
        </Badge>
      </div>
      <div>
        <p class="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
          {{ t('components.common.status') }}
        </p>
        <Badge
          v-if="user"
          :variant="user.isActive ? 'success' : 'danger'"
          dot
        >
          {{ user.isActive ? t('components.common.active') : t('components.common.inactive') }}
        </Badge>
      </div>
    </div>

    <template #footer>
      <Button
        variant="outline"
        @click="emit('close')"
      >
        {{ t('components.common.cancel') }}
      </Button>
      <Button
        variant="danger"
        @click="showDeleteConfirm = true"
      >
        {{ t('components.common.delete') }}
      </Button>
    </template>
  </Drawer>

  <ConfirmDialog
    :is-open="showDeleteConfirm"
    :title="t('users.deleteTitle')"
    :message="t('users.deleteMessage', { name: user?.fullName ?? '' })"
    :confirm-label="t('components.common.delete')"
    :cancel-label="t('components.common.cancel')"
    variant="danger"
    @close="showDeleteConfirm = false"
    @confirm="handleDeleteConfirm"
  />
</template>
