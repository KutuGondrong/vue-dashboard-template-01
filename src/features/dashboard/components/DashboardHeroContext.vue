<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useLocale } from '@/locales/localeStore';
import type { User, UserRole } from '@/models/model.type';

const props = defineProps<{
  user: User;
}>();

const { t, locale } = useLocale();
const now = ref(new Date());

const ROLE_LABEL_KEYS: Record<UserRole, string> = {
  admin: 'dashboard.charts.admin',
  moderator: 'dashboard.charts.moderator',
  user: 'dashboard.charts.user',
};

const dayNumber = computed(() =>
  new Intl.DateTimeFormat(locale.value, { day: 'numeric' }).format(now.value),
);

const weekday = computed(() =>
  new Intl.DateTimeFormat(locale.value, { weekday: 'long' }).format(now.value),
);

const month = computed(() =>
  new Intl.DateTimeFormat(locale.value, { month: 'long' }).format(now.value),
);

const time = computed(() =>
  new Intl.DateTimeFormat(locale.value, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(now.value),
);

const roleLabel = computed(() => t(ROLE_LABEL_KEYS[props.user.role]));

let timer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date();
  }, 30_000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <div
    class="w-full"
    :aria-label="t('dashboard.heroToday')"
  >
    <div class="flex items-center justify-between gap-2">
      <p
        class="text-[10px] font-semibold uppercase tracking-wider text-stone-500 sm:text-xs dark:text-stone-400"
      >
        {{ t('dashboard.heroToday') }}
      </p>

      <div class="flex shrink-0 items-center gap-2">
        <span
          class="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white/80 px-2.5 py-1 text-xs font-medium text-stone-700 dark:border-surface-600 dark:bg-surface-900/60 dark:text-stone-200"
        >
          <span
            class="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500"
            aria-hidden="true"
          />
          {{ t('dashboard.heroOnline') }}
        </span>
        <span
          class="rounded-full border border-stone-200 bg-white/80 px-2.5 py-1 text-xs font-medium text-stone-700 dark:border-surface-600 dark:bg-surface-900/60 dark:text-stone-200"
        >
          {{ roleLabel }}
        </span>
      </div>
    </div>

    <div class="mt-3 flex items-center gap-3">
      <p
        class="text-3xl font-bold tabular-nums leading-none text-stone-900 sm:text-4xl dark:text-white"
      >
        {{ dayNumber }}
      </p>
      <div class="min-w-0 flex-1">
        <p
          class="truncate text-sm font-medium capitalize text-stone-800 sm:text-base dark:text-stone-100"
        >
          {{ weekday }}
        </p>
        <p class="truncate text-xs capitalize text-stone-500 dark:text-stone-400">
          {{ month }}
        </p>
      </div>
      <p
        class="shrink-0 text-lg font-semibold tabular-nums tracking-wide text-stone-800 sm:text-xl dark:text-stone-100"
      >
        {{ time }}
      </p>
    </div>
  </div>
</template>
