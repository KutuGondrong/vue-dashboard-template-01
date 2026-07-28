<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useLocale } from '@/locales/localeStore';
import { useUsersStore } from '@/features/users/stores/usersStore';
import type { TableColumn, User, UserRole } from '@/models/model.type';
import { DataTable, DataTableActionButton, DataTableGroup } from '@/components/DataTable';
import { Pagination } from '@/components/Pagination';
import { Button } from '@/components/Button';
import Badge from '@/components/Badge/Badge.vue';
import Avatar from '@/components/Avatar/Avatar.vue';
import UserEditDrawer from '@/features/users/components/UserEditDrawer.vue';
import UserDeleteDrawer from '@/features/users/components/UserDeleteDrawer.vue';
import UserBulkDeleteDrawer from '@/features/users/components/UserBulkDeleteDrawer.vue';

const { t } = useLocale();
const usersStore = useUsersStore();

const { users, isLoading, selectedIds, page, pageSize, totalPages, totalItems } =
  storeToRefs(usersStore);

const editingUser = ref<User | null>(null);
const deletingUser = ref<User | null>(null);
const bulkDeleteOpen = ref(false);

const selectedUsers = computed(() =>
  users.value.filter((user) => selectedIds.value.includes(user.id)),
);

const columns = computed<TableColumn<User>[]>(() => [
  {
    key: 'fullName',
    header: t('components.common.name'),
  },
  {
    key: 'email',
    header: t('components.common.email'),
  },
  {
    key: 'role',
    header: t('components.common.role'),
  },
  {
    key: 'isActive',
    header: t('components.common.status'),
  },
]);

function roleVariant(role: UserRole) {
  if (role === 'admin') return 'primary';
  if (role === 'moderator') return 'info';
  return 'default';
}

onMounted(() => {
  usersStore.init();
});
</script>

<template>
  <DataTableGroup>
    <DataTable
      unwrapped
      :data="users"
      :columns="columns"
      :is-loading="isLoading"
      row-selection="checkbox"
      :selected-ids="selectedIds"
      @selection-change="usersStore.setSelectedIds"
    >
      <template #selection-actions>
        <Button
          variant="danger"
          size="sm"
          @click="bulkDeleteOpen = true"
        >
          {{ t('components.common.delete') }} ({{ selectedIds.length }})
        </Button>
      </template>
      <template #fullName="{ item }">
        <div class="flex items-center gap-3">
          <Avatar
            :name="item.fullName"
            :src="item.avatarUrl"
            size="sm"
          />
          <span>{{ item.fullName }}</span>
        </div>
      </template>
      <template #role="{ item }">
        <Badge :variant="roleVariant(item.role)">
          {{ item.role }}
        </Badge>
      </template>
      <template #isActive="{ item }">
        <Badge
          :variant="item.isActive ? 'success' : 'danger'"
          :dot="true"
        >
          {{ item.isActive ? t('components.common.active') : t('components.common.inactive') }}
        </Badge>
      </template>
      <template #actions="{ item }">
        <DataTableActionButton @click="editingUser = item">
          {{ t('components.common.edit') }}
        </DataTableActionButton>
        <DataTableActionButton
          variant="danger"
          @click="deletingUser = item"
        >
          {{ t('components.common.delete') }}
        </DataTableActionButton>
      </template>
    </DataTable>

    <template #footer>
      <Pagination
        :current-page="page"
        :total-pages="totalPages"
        :page-size="pageSize"
        :total-items="totalItems"
        @page-change="usersStore.setPage"
        @page-size-change="usersStore.setPageSize"
      />
    </template>
  </DataTableGroup>

  <UserEditDrawer
    :is-open="editingUser !== null"
    :user="editingUser"
    @close="editingUser = null"
    @save="
      (payload) => {
        if (editingUser) usersStore.updateUser(editingUser.id, payload);
      }
    "
  />

  <UserDeleteDrawer
    :is-open="deletingUser !== null"
    :user="deletingUser"
    @close="deletingUser = null"
    @delete="
      () => {
        if (deletingUser) usersStore.deleteUser(deletingUser.id);
      }
    "
  />

  <UserBulkDeleteDrawer
    :is-open="bulkDeleteOpen"
    :users="selectedUsers"
    @close="bulkDeleteOpen = false"
    @delete="usersStore.deleteUsers(selectedIds)"
  />
</template>
