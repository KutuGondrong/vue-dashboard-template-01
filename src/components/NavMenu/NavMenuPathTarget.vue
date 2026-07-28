<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { cn } from '@/components/Layout/layoutUtils';
import { rowBase, isNavPathActive } from './navMenuUtils';
import type { ItemContext } from './navMenu.types';

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    path: string;
    end?: boolean;
    title?: string;
    onAfterNavigate?: () => void;
    rowClass?: string | ((isActive: boolean) => string);
    variant?: 'row' | 'inline';
    ctx: ItemContext;
  }>(),
  {
    variant: 'row',
  },
);

function resolveRowClass(isActive: boolean) {
  const source = props.rowClass;
  if (typeof source === 'function') return source(isActive);
  return source;
}

function targetClass(isActive: boolean) {
  return props.variant === 'inline'
    ? cn('flex min-w-0 flex-1 items-center', resolveRowClass(isActive))
    : cn(rowBase, resolveRowClass(isActive));
}

function handleCustomNavigate() {
  props.ctx.navigateTo!(props.path);
  props.onAfterNavigate?.();
}

function handleRouterNavigate(e: MouseEvent, navigate: (e?: MouseEvent) => void) {
  navigate(e);
  // Custom navigate already reports via navigateTo → onActivate; router path needs it here.
  props.ctx.onActivate?.(props.path);
  props.onAfterNavigate?.();
}
</script>

<template>
  <button
    v-if="ctx.navigateTo"
    type="button"
    :title="title"
    :class="targetClass(isNavPathActive(path, ctx.pathname, end))"
    @click="handleCustomNavigate"
  >
    <slot />
  </button>
  <RouterLink
    v-else
    v-slot="{ href, navigate }"
    :to="path"
    :end="end"
    :title="title"
    custom
  >
    <a
      :href="href"
      :class="targetClass(isNavPathActive(path, ctx.pathname, end))"
      @click="(e) => handleRouterNavigate(e, navigate)"
    >
      <slot />
    </a>
  </RouterLink>
</template>
