<script setup lang="ts">
import Avatar from './Avatar.vue';

type PresenceStatus = 'online' | 'offline' | 'away' | 'busy';

defineProps<{
  name: string;
  email?: string;
  role?: string;
  avatarUrl?: string | null;
  presence?: PresenceStatus;
}>();
</script>

<template>
  <div
    class="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-surface-600 dark:bg-surface-800"
  >
    <Avatar
      :src="avatarUrl"
      :name="name"
      size="lg"
      :presence="presence"
    />
    <div class="min-w-0 flex-1">
      <p class="truncate font-medium text-stone-900 dark:text-white">
        {{ name }}
      </p>
      <p
        v-if="email"
        class="truncate text-sm text-stone-500 dark:text-stone-400"
      >
        {{ email }}
      </p>
      <p
        v-if="role"
        class="mt-0.5 text-xs font-medium uppercase tracking-wide text-primary-600 dark:text-primary-400"
      >
        {{ role }}
      </p>
    </div>
  </div>
</template>
