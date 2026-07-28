import { appConfig } from '@/config/app.config';
import { usersUsecase } from '@/features/users/usecase/usersUsecase';
import type { ModelPayload } from '@/models/model.payload';
import type { User } from '@/models/model.type';
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([]);
  const isLoading = ref(true);
  const selectedIds = ref<string[]>([]);
  const page = ref(1);
  const pageSize = ref<number>(appConfig.paginationDefaultPageSize);
  const totalPages = ref(1);
  const totalItems = ref(0);

  async function fetchUsers(): Promise<void> {
    isLoading.value = true;
    try {
      const result = await usersUsecase.getUsers(page.value, pageSize.value);
      users.value = result.data;
      totalPages.value = result.totalPages;
      totalItems.value = result.total;
    } finally {
      isLoading.value = false;
    }
  }

  watch([page, pageSize], () => {
    void fetchUsers();
    selectedIds.value = [];
  });

  function setPage(nextPage: number): void {
    page.value = nextPage;
  }

  function setPageSize(size: number): void {
    pageSize.value = size;
    page.value = 1;
  }

  function setSelectedIds(ids: string[]): void {
    selectedIds.value = ids;
  }

  function updateUser(
    userId: string,
    payload: ModelPayload<User, 'fullName' | 'email' | 'role' | 'isActive'>,
  ): void {
    users.value = users.value.map((user) => (user.id === userId ? { ...user, ...payload } : user));
  }

  function deleteUser(userId: string): void {
    users.value = users.value.filter((user) => user.id !== userId);
    selectedIds.value = selectedIds.value.filter((id) => id !== userId);
    const nextTotal = Math.max(0, totalItems.value - 1);
    totalItems.value = nextTotal;
    const nextTotalPages = Math.max(1, Math.ceil(nextTotal / pageSize.value));
    totalPages.value = nextTotalPages;
    page.value = Math.min(page.value, nextTotalPages);
  }

  function deleteUsers(userIds: string[]): void {
    const idSet = new Set(userIds);
    users.value = users.value.filter((user) => !idSet.has(user.id));
    selectedIds.value = selectedIds.value.filter((id) => !idSet.has(id));
    const nextTotal = Math.max(0, totalItems.value - userIds.length);
    totalItems.value = nextTotal;
    const nextTotalPages = Math.max(1, Math.ceil(nextTotal / pageSize.value));
    totalPages.value = nextTotalPages;
    page.value = Math.min(page.value, nextTotalPages);
  }

  function init(): void {
    void fetchUsers();
  }

  return {
    users,
    isLoading,
    selectedIds,
    page,
    pageSize,
    totalPages,
    totalItems,
    fetchUsers,
    setPage,
    setPageSize,
    setSelectedIds,
    updateUser,
    deleteUser,
    deleteUsers,
    init,
  };
});
