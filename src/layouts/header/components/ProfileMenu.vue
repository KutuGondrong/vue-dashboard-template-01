<script setup lang="ts">
import { computed } from 'vue';
import type { User } from '@/models/model.type';

const props = defineProps<{
  user: User;
  isOpen: boolean;
  settingsLabel: string;
  logoutLabel: string;
}>();

defineEmits<{ toggle: []; settings: []; logout: [] }>();

const initials = computed(() =>
  props.user.fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2),
);
</script>

<template>
  <div class="relative">
    <button
      type="button"
      :aria-expanded="isOpen"
      :class="[
        'rounded-full p-0.5 transition-colors hover:bg-stone-100 lg:rounded-lg lg:p-1.5 dark:hover:bg-surface-700',
        isOpen
          ? 'ring-2 ring-primary-500/40 ring-offset-2 ring-offset-white dark:ring-offset-surface-900'
          : '',
      ]"
      @click="$emit('toggle')"
    >
      <div class="relative inline-flex shrink-0">
        <div
          class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-xs font-medium text-primary-700 ring-2 ring-white dark:bg-primary-900/50 dark:text-primary-300 dark:ring-surface-900"
        >
          <img
            v-if="user.avatarUrl"
            :src="user.avatarUrl"
            :alt="user.fullName"
            class="h-full w-full object-cover"
          >
          <span v-else>{{ initials }}</span>
        </div>
        <span
          class="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-surface-900"
          aria-label="Status: online"
        />
      </div>
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 z-50 mt-2 w-[min(16rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg dark:border-surface-600 dark:bg-surface-800"
    >
      <div class="border-b border-stone-200 px-4 py-3 dark:border-surface-600">
        <p class="truncate text-sm font-medium text-stone-900 dark:text-white">
          {{ user.fullName }}
        </p>
        <p class="truncate text-xs text-stone-500 dark:text-stone-400">
          {{ user.email }}
        </p>
      </div>

      <div class="py-1">
        <button
          type="button"
          class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-surface-600/60"
          @click="$emit('settings')"
        >
          <svg
            class="h-5 w-5 shrink-0 text-stone-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {{ settingsLabel }}
        </button>

        <button
          type="button"
          class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          @click="$emit('logout')"
        >
          <svg
            class="h-5 w-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          {{ logoutLabel }}
        </button>
      </div>
    </div>
  </div>
</template>
