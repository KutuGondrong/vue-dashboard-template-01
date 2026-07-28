<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useLocale } from '@/locales/localeStore';
import type { SelectOption, User, UserRole } from '@/models/model.type';
import type { ModelPayload } from '@/models/model.payload';
import Drawer from '@/components/Drawer/Drawer.vue';
import { Button } from '@/components/Button';
import Input from '@/components/Input/Input.vue';
import ComboBox from '@/components/ComboBox/ComboBox.vue';
import ConfirmDialog from '@/components/Modal/ConfirmDialog.vue';

const props = defineProps<{
  isOpen: boolean;
  user: User | null;
}>();

const emit = defineEmits<{
  close: [];
  save: [payload: ModelPayload<User, 'fullName' | 'email' | 'role' | 'isActive'>];
}>();

const { t } = useLocale();

const fullName = ref('');
const email = ref('');
const role = ref<UserRole>('user');
const isActive = ref(true);
const showSaveConfirm = ref(false);

watch(
  () => [props.user, props.isOpen] as const,
  ([user, isOpen]) => {
    if (user && isOpen) {
      fullName.value = user.fullName;
      email.value = user.email;
      role.value = user.role;
      isActive.value = user.isActive;
    }
  },
);

watch(
  () => props.isOpen,
  (isOpen) => {
    if (!isOpen) showSaveConfirm.value = false;
  },
);

const roleOptions = computed<SelectOption[]>(() => [
  { value: 'admin', label: 'Admin' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'user', label: t('dashboard.charts.user') },
]);

const statusOptions = computed<SelectOption[]>(() => [
  { value: 'true', label: t('components.common.active') },
  { value: 'false', label: t('components.common.inactive') },
]);

function handleSaveConfirm() {
  emit('save', {
    fullName: fullName.value,
    email: email.value,
    role: role.value,
    isActive: isActive.value,
  });
  showSaveConfirm.value = false;
  emit('close');
}
</script>

<template>
  <Drawer
    :is-open="isOpen"
    :title="t('users.editTitle')"
    :description="t('users.editDescription')"
    size="md"
    @close="emit('close')"
  >
    <div class="space-y-5">
      <Input
        :label="t('components.common.name')"
        :model-value="fullName"
        :debounce-seconds="0"
        @update:model-value="fullName = $event"
      />
      <Input
        :label="t('components.common.email')"
        type="email"
        :model-value="email"
        :debounce-seconds="0"
        @update:model-value="email = $event"
      />
      <ComboBox
        :label="t('components.common.role')"
        :options="roleOptions"
        :value="role"
        :searchable="false"
        @select="(option) => (role = option.value as UserRole)"
      />
      <ComboBox
        :label="t('components.common.status')"
        :options="statusOptions"
        :value="String(isActive)"
        :searchable="false"
        @select="(option) => (isActive = option.value === 'true')"
      />
    </div>

    <template #footer>
      <Button
        variant="outline"
        @click="emit('close')"
      >
        {{ t('components.common.cancel') }}
      </Button>
      <Button @click="showSaveConfirm = true">
        {{ t('components.common.save') }}
      </Button>
    </template>
  </Drawer>

  <ConfirmDialog
    :is-open="showSaveConfirm"
    :title="t('users.saveTitle')"
    :message="t('users.saveMessage', { name: user?.fullName ?? '' })"
    :confirm-label="t('components.common.save')"
    :cancel-label="t('components.common.cancel')"
    variant="primary"
    @close="showSaveConfirm = false"
    @confirm="handleSaveConfirm"
  />
</template>
