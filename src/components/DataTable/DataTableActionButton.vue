<script setup lang="ts">
import { Button } from '@/components/Button';

withDefaults(
  defineProps<{
    variant?: 'ghost' | 'danger';
  }>(),
  {
    variant: 'ghost',
  },
);

const emit = defineEmits<{ click: [] }>();
</script>

<template>
  <Button
    :variant="variant === 'danger' ? 'danger' : 'ghost'"
    size="sm"
    @click="emit('click')"
  >
    <slot />
  </Button>
</template>
