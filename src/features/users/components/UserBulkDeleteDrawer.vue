<script setup lang="ts">
import { computed } from 'vue';
import { useLocale } from '@/locales/localeStore';
import type { User } from '@/models/model.type';
import Drawer from '@/components/Drawer/Drawer.vue';
import { Button } from '@/components/Button';
import Avatar from '@/components/Avatar/Avatar.vue';
import Badge from '@/components/Badge/Badge.vue';
import { useModalStore } from '@/components/Modal';

const props = defineProps<{
  isOpen: boolean;
  users: User[];
}>();

const emit = defineEmits<{
  close: [];
  delete: [];
}>();

const { t } = useLocale();
const { confirm } = useModalStore();

const userCount = computed(() => props.users.length);

async function handleDeleteClick() {
  const confirmed = await confirm({
    title: t('users.bulkDeleteTitle'),
    message: t('users.bulkDeleteMessage', { count: userCount.value }),
    confirmLabel: t('components.common.delete'),
    cancelLabel: t('components.common.cancel'),
    variant: 'danger',
  });

  if (confirmed) {
    emit('delete');
    emit('close');
  }
}
</script>

<template>
  <Drawer
    :is-open="isOpen"
    :title="t('users.bulkDeleteTitle')"
    :description="t('users.bulkDeleteDescription', { count: userCount })"
    size="md"
    @close="emit('close')"
  >
    <ul class="divide-y divide-stone-200 dark:divide-stone-700">
      <li
        v-for="user in users"
        :key="user.id"
        class="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
      >
        <Avatar
          :name="user.fullName"
          :src="user.avatarUrl"
          size="sm"
        />
        <div class="min-w-0 flex-1">
          <p class="truncate font-medium text-stone-900 dark:text-white">
            {{ user.fullName }}
          </p>
          <p class="truncate text-sm text-stone-500 dark:text-stone-400">
            {{ user.email }}
          </p>
        </div>
        <Badge
          :variant="
            user.role === 'admin' ? 'primary' : user.role === 'moderator' ? 'info' : 'default'
          "
        >
          {{ user.role }}
        </Badge>
      </li>
    </ul>

    <template #footer>
      <Button
        variant="outline"
        @click="emit('close')"
      >
        {{ t('components.common.cancel') }}
      </Button>
      <Button
        variant="danger"
        @click="handleDeleteClick"
      >
        {{ t('components.common.delete') }}
      </Button>
    </template>
  </Drawer>
</template>
