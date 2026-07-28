<script setup lang="ts">
import { computed } from 'vue';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type PresenceStatus = 'online' | 'offline' | 'away' | 'busy';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  presence?: PresenceStatus;
}

const props = withDefaults(defineProps<AvatarProps>(), {
  alt: '',
  name: '',
  size: 'md',
});

const sizeClasses: Record<AvatarSize, { container: string; text: string; ring: string }> = {
  xs: { container: 'h-6 w-6', text: 'text-[10px]', ring: 'ring-1' },
  sm: { container: 'h-8 w-8', text: 'text-xs', ring: 'ring-2' },
  md: { container: 'h-10 w-10', text: 'text-sm', ring: 'ring-2' },
  lg: { container: 'h-12 w-12', text: 'text-base', ring: 'ring-2' },
  xl: { container: 'h-16 w-16', text: 'text-lg', ring: 'ring-[3px]' },
};

const presenceColors: Record<PresenceStatus, string> = {
  online: 'bg-success-500',
  offline: 'bg-stone-400',
  away: 'bg-yellow-500',
  busy: 'bg-danger-500',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const sizeConfig = computed(() => sizeClasses[props.size]);
const initials = computed(() => (props.name ? getInitials(props.name) : '?'));
</script>

<template>
  <div class="relative inline-flex shrink-0">
    <div
      :class="`${sizeConfig.container} ${sizeConfig.ring} flex items-center justify-center overflow-hidden rounded-full bg-primary-100 font-medium text-primary-700 ring-white dark:bg-primary-900/50 dark:text-primary-300 dark:ring-surface-900`"
    >
      <img
        v-if="src"
        :src="src"
        :alt="alt || name"
        class="h-full w-full object-cover"
      >
      <span
        v-else
        :class="sizeConfig.text"
      >{{ initials }}</span>
    </div>
    <span
      v-if="presence"
      :class="`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ${presenceColors[presence]} ring-2 ring-white dark:ring-surface-900`"
      :aria-label="`Status: ${presence}`"
    />
  </div>
</template>
