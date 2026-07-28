<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, unref, type Ref } from 'vue';
import { useRoute } from 'vue-router';
import { cn } from '@/components/Layout/layoutUtils';
import { useLocale } from '@/locales/localeStore';
import {
  getNavMenuScrollState,
  scrollNavMenuSection,
  type NavMenuScrollState,
} from '@/components/NavMenu/navMenuScroll';
import NavMenuNode from './NavMenuNode.vue';
import NavMenuScrollButton from './NavMenuScrollButton.vue';
import NavMenuCollapseTrigger from './NavMenuCollapseTrigger.vue';
import {
  findItemByKey,
  getExpandScope,
  collectDescendantKeysWithChildren,
  seedDefaultExpandedSubtree,
  mergeOpenKeysForPath,
  resolveOpenKeysFromProps,
  openKeysEqual,
  toOpenKeysArray,
  isPeekingCollapseTrigger,
} from './navMenuUtils';
import type {
  NavMenuItem,
  NavMenuScrollControls,
  CollapseTriggerPosition,
  ItemContext,
} from './navMenu.types';

export type { NavMenuItem, NavMenuScrollControls, CollapseTriggerPosition };
export type { NavMenuProps } from './navMenu.types';

const props = withDefaults(
  defineProps<{
    items: NavMenuItem[];
    collapsed?: boolean;
    startCollapsed?: boolean;
    class?: string;
    collapsible?: boolean;
    collapseTriggerPosition?: CollapseTriggerPosition;
    childrenMode?: 'collapsible' | 'always';
    childConnector?: 'none' | 'tree';
    defaultExpandScope?: 'independent' | 'all';
    flyoutDismissOnAction?: boolean;
    initialOpenKeys?: string[];
    pathname?: string;
    navigateTo?: (path: string) => void;
    showScrollbar?: boolean;
    scrollControls?: NavMenuScrollControls;
    scrollControlsVariant?: 'pill' | 'bar';
    embedded?: boolean;
    manageWidth?: boolean;
    peekingHostRef?: Ref<HTMLElement | null> | HTMLElement | null;
    /** Aria/label wording for the collapse control (`sidebar` matches app chrome). */
    collapseLabelVariant?: 'menu' | 'sidebar';
  }>(),
  {
    startCollapsed: false,
    collapsible: false,
    collapseTriggerPosition: 'top',
    childrenMode: 'collapsible',
    childConnector: 'tree',
    defaultExpandScope: 'independent',
    flyoutDismissOnAction: true,
    initialOpenKeys: () => [],
    showScrollbar: false,
    scrollControls: 'all',
    scrollControlsVariant: 'pill',
    embedded: false,
    manageWidth: true,
    peekingHostRef: null,
    collapseLabelVariant: 'menu',
  },
);

const emit = defineEmits<{
  navigate: [path: string];
  collapse: [collapsed: boolean];
  /** Fired when `embedded` and the user activates a navigable leaf/path (e.g. close mobile drawer). */
  dismiss: [];
}>();

const { t } = useLocale();
const route = useRoute();
const navRef = ref<HTMLElement | null>(null);

const peekingHostEl = computed((): HTMLElement | null => {
  const host = props.peekingHostRef;
  if (!host) return null;
  if (host instanceof HTMLElement) return host;
  return unref(host);
});

const pathname = computed(() => (props.pathname !== undefined ? props.pathname : route.path));
const defaultExpandedSeededRef = ref(new Set<string>());
const isAlive = ref(true);
const isCollapseControlled = computed(() => props.collapsed !== undefined);
const internalCollapsed = ref(props.startCollapsed);
const scrollState = ref<NavMenuScrollState>({
  canScroll: false,
  canScrollUp: false,
  canScrollDown: false,
});

let scrollCleanup: (() => void) | null = null;

onBeforeUnmount(() => {
  isAlive.value = false;
  scrollCleanup?.();
  scrollCleanup = null;
});

function onActivate(path?: string) {
  if (path) emit('navigate', path);
  if (props.embedded) emit('dismiss');
}

function handleNavigate(path: string) {
  props.navigateTo?.(path);
  onActivate(path);
}

const usesCustomNavigation = computed(
  () => props.pathname !== undefined || props.navigateTo !== undefined,
);

const openKeys = ref(
  resolveOpenKeysFromProps(
    props.items,
    pathname.value,
    props.childrenMode,
    props.initialOpenKeys ?? [],
    defaultExpandedSeededRef.value,
  ),
);
const flyoutKey = ref<string | null>(null);
const userCollapsedKeys = ref(new Set<string>());

const isCollapsed = computed(() => {
  if (props.collapsible) {
    return isCollapseControlled.value ? props.collapsed! : internalCollapsed.value;
  }
  return props.startCollapsed;
});

watch(
  () => props.startCollapsed,
  (next) => {
    if (!isCollapseControlled.value) {
      internalCollapsed.value = next;
    }
  },
);

watch(
  () => props.collapsed,
  (next) => {
    if (next !== undefined && !isCollapseControlled.value) {
      internalCollapsed.value = next;
    }
  },
);

watch(isCollapsed, () => {
  flyoutKey.value = null;
});

function refreshScrollState() {
  scrollState.value = getNavMenuScrollState(navRef.value, isCollapsed.value);
}

watch(
  () => [props.items, openKeys.value, isCollapsed.value] as const,
  () => {
    void nextTick(refreshScrollState);
  },
  { flush: 'post' },
);

onMounted(() => {
  refreshScrollState();
  const nav = navRef.value;
  if (!nav) return;

  const handleScroll = () => refreshScrollState();
  nav.addEventListener('scroll', handleScroll, { passive: true });
  nav.addEventListener('scrollend', handleScroll);

  const observer = new ResizeObserver(handleScroll);
  observer.observe(nav);
  for (const section of nav.querySelectorAll('[data-nav-section]')) {
    observer.observe(section);
  }

  scrollCleanup = () => {
    nav.removeEventListener('scroll', handleScroll);
    nav.removeEventListener('scrollend', handleScroll);
    observer.disconnect();
  };
});

watch(
  () =>
    props.pathname !== undefined
      ? ([props.items, props.pathname, props.childrenMode, props.initialOpenKeys] as const)
      : ([props.items, route.path, props.childrenMode, props.initialOpenKeys] as const),
  ([nextItems, nextPathname, nextChildrenMode, nextInitialOpenKeys], prev) => {
    if (!isAlive.value) return;

    const prevChildrenMode = prev?.[2];
    const childrenModeChanged =
      prevChildrenMode !== undefined && prevChildrenMode !== nextChildrenMode;
    const initialOpenKeysChanged =
      prev !== undefined && !openKeysEqual(prev[3] ?? [], nextInitialOpenKeys ?? []);

    if (nextChildrenMode === 'always') {
      openKeys.value = resolveOpenKeysFromProps(
        nextItems,
        nextPathname,
        nextChildrenMode,
        nextInitialOpenKeys ?? [],
        defaultExpandedSeededRef.value,
      );
      return;
    }

    if (childrenModeChanged || initialOpenKeysChanged) {
      userCollapsedKeys.value = new Set();
      defaultExpandedSeededRef.value = new Set();
      openKeys.value = resolveOpenKeysFromProps(
        nextItems,
        nextPathname,
        nextChildrenMode,
        nextInitialOpenKeys ?? [],
        defaultExpandedSeededRef.value,
      );
      return;
    }

    const next = mergeOpenKeysForPath(
      openKeys.value,
      nextItems,
      nextPathname,
      defaultExpandedSeededRef.value,
      userCollapsedKeys.value,
    );
    if (next) {
      openKeys.value = next;
    }
  },
  { immediate: true },
);

function onToggle(key: string) {
  const item = findItemByKey(props.items, key);
  const scope = getExpandScope(item, props.defaultExpandScope);

  const next = new Set(openKeys.value);
  if (next.has(key)) {
    userCollapsedKeys.value.add(key);
    next.delete(key);
    if (scope === 'all' && item?.children) {
      for (const descendantKey of collectDescendantKeysWithChildren(item.children)) {
        next.delete(descendantKey);
      }
    }
  } else {
    userCollapsedKeys.value.delete(key);
    next.add(key);
    if (item) seedDefaultExpandedSubtree(item, next, defaultExpandedSeededRef.value);
    if (scope === 'all' && item?.children) {
      for (const descendantKey of collectDescendantKeysWithChildren(item.children)) {
        next.add(descendantKey);
      }
    }
  }

  const nextKeys = toOpenKeysArray(next);
  if (openKeysEqual(nextKeys, openKeys.value)) return;
  openKeys.value = nextKeys;
}

function ensureOpen(key: string) {
  userCollapsedKeys.value.delete(key);
  if (openKeys.value.includes(key)) return;

  const item = findItemByKey(props.items, key);
  const scope = getExpandScope(item, props.defaultExpandScope);
  const next = new Set(openKeys.value);
  next.add(key);
  if (item) seedDefaultExpandedSubtree(item, next, defaultExpandedSeededRef.value);
  if (scope === 'all' && item?.children) {
    for (const descendantKey of collectDescendantKeysWithChildren(item.children)) {
      next.add(descendantKey);
    }
  }
  openKeys.value = toOpenKeysArray(next);
}

function onFlyoutToggle(key: string | null) {
  if (flyoutKey.value === key) return;
  flyoutKey.value = key;
}

function handleCollapseToggle() {
  const next = !isCollapsed.value;
  if (!isCollapseControlled.value) {
    internalCollapsed.value = next;
  }
  emit('collapse', next);
}

const resolvedClass = computed(() => props.class);
const usesSidebarWidth = computed(
  () => props.manageWidth && (props.collapsible || props.startCollapsed),
);

const ctx = computed(
  (): ItemContext => ({
    collapsed: isCollapsed.value,
    depth: 0,
    pathname: pathname.value,
    openKeys: new Set(openKeys.value),
    onToggle,
    ensureOpen,
    flyoutKey: flyoutKey.value,
    onFlyoutToggle,
    childConnector: props.childConnector,
    flyoutDismissOnAction: props.flyoutDismissOnAction,
    navigateTo: usesCustomNavigation.value ? handleNavigate : undefined,
    onActivate,
  }),
);

const scrollControlsEnabled = computed(() => props.scrollControls !== 'none');
const showSectionScrollControls = computed(
  () => !isCollapsed.value && scrollState.value.canScroll && scrollControlsEnabled.value,
);
const showScrollUp = computed(
  () =>
    showSectionScrollControls.value &&
    scrollState.value.canScrollUp &&
    (props.scrollControls === 'top' || props.scrollControls === 'all'),
);
const showScrollDown = computed(
  () =>
    showSectionScrollControls.value &&
    scrollState.value.canScrollDown &&
    (props.scrollControls === 'bottom' || props.scrollControls === 'all'),
);

const showPeeking = computed(
  () => props.collapsible && isPeekingCollapseTrigger(props.collapseTriggerPosition),
);
const wantsPeekingHost = computed(() => showPeeking.value && props.peekingHostRef != null);
const mountPeekingOnHost = computed(() => wantsPeekingHost.value && Boolean(peekingHostEl.value));

const needsPeekingNavPadding = computed(
  () =>
    isPeekingCollapseTrigger(props.collapseTriggerPosition) &&
    !props.embedded &&
    !mountPeekingOnHost.value,
);

const navScrollPadding = computed(() =>
  isCollapsed.value
    ? cn('px-2 pt-2', mountPeekingOnHost.value ? 'pb-2' : 'pb-6')
    : cn(props.embedded ? 'px-0' : 'p-2', needsPeekingNavPadding.value && 'pb-6'),
);

function scrollUp() {
  const nav = navRef.value;
  if (nav) scrollNavMenuSection(nav, 'up', refreshScrollState);
}

function scrollDown() {
  const nav = navRef.value;
  if (nav) scrollNavMenuSection(nav, 'down', refreshScrollState);
}
</script>

<template>
  <template v-if="!usesSidebarWidth">
    <template v-if="!showPeeking || wantsPeekingHost">
      <div
        :class="
          cn('relative flex h-full min-h-0 w-full flex-1 flex-col overflow-visible', resolvedClass)
        "
      >
        <NavMenuCollapseTrigger
          v-if="collapsible && collapseTriggerPosition === 'top'"
          :collapsed="isCollapsed"
          position="top"
          :label-variant="collapseLabelVariant"
          @toggle="handleCollapseToggle"
        />
        <NavMenuScrollButton
          v-if="showScrollUp && scrollControlsVariant === 'bar'"
          direction="up"
          variant="bar"
          @click="scrollUp"
        />
        <div
          v-else-if="showScrollUp"
          class="flex w-full shrink-0 justify-center border-b border-stone-200 py-1 dark:border-surface-600"
        >
          <NavMenuScrollButton
            direction="up"
            @click="scrollUp"
          />
        </div>
        <nav
          ref="navRef"
          :class="
            cn(
              'relative min-h-0 flex-1 space-y-1.5',
              isCollapsed ? 'overflow-visible' : 'overflow-auto',
              navScrollPadding,
              !isCollapsed && !showScrollbar && 'scrollbar-hide',
            )
          "
          :aria-label="t('components.common.navigation')"
        >
          <div
            v-for="item in items"
            :key="item.key"
            data-nav-section
          >
            <NavMenuNode
              :item="item"
              :ctx="ctx"
            />
          </div>
        </nav>
        <NavMenuScrollButton
          v-if="showScrollDown && scrollControlsVariant === 'bar'"
          direction="down"
          variant="bar"
          @click="scrollDown"
        />
        <div
          v-else-if="showScrollDown"
          class="flex w-full shrink-0 justify-center border-t border-stone-200 py-1 dark:border-surface-600"
        >
          <NavMenuScrollButton
            direction="down"
            @click="scrollDown"
          />
        </div>
        <NavMenuCollapseTrigger
          v-if="collapsible && collapseTriggerPosition === 'bottom'"
          :collapsed="isCollapsed"
          position="bottom"
          :label-variant="collapseLabelVariant"
          @toggle="handleCollapseToggle"
        />
      </div>
      <Teleport
        v-if="mountPeekingOnHost && showPeeking"
        :to="peekingHostEl!"
      >
        <NavMenuCollapseTrigger
          :collapsed="isCollapsed"
          :position="collapseTriggerPosition"
          :label-variant="collapseLabelVariant"
          @toggle="handleCollapseToggle"
        />
      </Teleport>
    </template>
    <div
      v-else
      class="relative z-10 h-full min-h-0 overflow-visible"
    >
      <div
        :class="
          cn('relative flex h-full min-h-0 w-full flex-1 flex-col overflow-visible', resolvedClass)
        "
      >
        <NavMenuCollapseTrigger
          v-if="collapsible && collapseTriggerPosition === 'top'"
          :collapsed="isCollapsed"
          position="top"
          :label-variant="collapseLabelVariant"
          @toggle="handleCollapseToggle"
        />
        <NavMenuScrollButton
          v-if="showScrollUp && scrollControlsVariant === 'bar'"
          direction="up"
          variant="bar"
          @click="scrollUp"
        />
        <div
          v-else-if="showScrollUp"
          class="flex w-full shrink-0 justify-center border-b border-stone-200 py-1 dark:border-surface-600"
        >
          <NavMenuScrollButton
            direction="up"
            @click="scrollUp"
          />
        </div>
        <nav
          ref="navRef"
          :class="
            cn(
              'relative min-h-0 flex-1 space-y-1.5',
              isCollapsed ? 'overflow-visible' : 'overflow-auto',
              navScrollPadding,
              !isCollapsed && !showScrollbar && 'scrollbar-hide',
            )
          "
          :aria-label="t('components.common.navigation')"
        >
          <div
            v-for="item in items"
            :key="item.key"
            data-nav-section
          >
            <NavMenuNode
              :item="item"
              :ctx="ctx"
            />
          </div>
        </nav>
        <NavMenuScrollButton
          v-if="showScrollDown && scrollControlsVariant === 'bar'"
          direction="down"
          variant="bar"
          @click="scrollDown"
        />
        <div
          v-else-if="showScrollDown"
          class="flex w-full shrink-0 justify-center border-t border-stone-200 py-1 dark:border-surface-600"
        >
          <NavMenuScrollButton
            direction="down"
            @click="scrollDown"
          />
        </div>
        <NavMenuCollapseTrigger
          v-if="collapsible && collapseTriggerPosition === 'bottom'"
          :collapsed="isCollapsed"
          position="bottom"
          :label-variant="collapseLabelVariant"
          @toggle="handleCollapseToggle"
        />
      </div>
      <NavMenuCollapseTrigger
        v-if="showPeeking"
        :collapsed="isCollapsed"
        :position="collapseTriggerPosition"
        :label-variant="collapseLabelVariant"
        @toggle="handleCollapseToggle"
      />
    </div>
  </template>
  <template v-else>
    <div
      :class="
        cn(
          'relative flex shrink-0 flex-col overflow-visible transition-[width] duration-200',
          showPeeking && !wantsPeekingHost ? 'z-10 h-full min-h-0' : 'min-h-0',
          isCollapsed ? 'w-[72px]' : 'w-64',
        )
      "
    >
      <div
        :class="
          cn('relative flex h-full min-h-0 w-full flex-1 flex-col overflow-visible', resolvedClass)
        "
      >
        <NavMenuCollapseTrigger
          v-if="collapsible && collapseTriggerPosition === 'top'"
          :collapsed="isCollapsed"
          position="top"
          :label-variant="collapseLabelVariant"
          @toggle="handleCollapseToggle"
        />
        <NavMenuScrollButton
          v-if="showScrollUp && scrollControlsVariant === 'bar'"
          direction="up"
          variant="bar"
          @click="scrollUp"
        />
        <div
          v-else-if="showScrollUp"
          class="flex w-full shrink-0 justify-center border-b border-stone-200 py-1 dark:border-surface-600"
        >
          <NavMenuScrollButton
            direction="up"
            @click="scrollUp"
          />
        </div>
        <nav
          ref="navRef"
          :class="
            cn(
              'relative min-h-0 flex-1 space-y-1.5',
              isCollapsed ? 'overflow-visible' : 'overflow-auto',
              navScrollPadding,
              !isCollapsed && !showScrollbar && 'scrollbar-hide',
            )
          "
          :aria-label="t('components.common.navigation')"
        >
          <div
            v-for="item in items"
            :key="item.key"
            data-nav-section
          >
            <NavMenuNode
              :item="item"
              :ctx="ctx"
            />
          </div>
        </nav>
        <NavMenuScrollButton
          v-if="showScrollDown && scrollControlsVariant === 'bar'"
          direction="down"
          variant="bar"
          @click="scrollDown"
        />
        <div
          v-else-if="showScrollDown"
          class="flex w-full shrink-0 justify-center border-t border-stone-200 py-1 dark:border-surface-600"
        >
          <NavMenuScrollButton
            direction="down"
            @click="scrollDown"
          />
        </div>
        <NavMenuCollapseTrigger
          v-if="collapsible && collapseTriggerPosition === 'bottom'"
          :collapsed="isCollapsed"
          position="bottom"
          :label-variant="collapseLabelVariant"
          @toggle="handleCollapseToggle"
        />
      </div>
      <NavMenuCollapseTrigger
        v-if="showPeeking && !wantsPeekingHost"
        :collapsed="isCollapsed"
        :position="collapseTriggerPosition"
        :label-variant="collapseLabelVariant"
        @toggle="handleCollapseToggle"
      />
    </div>
    <Teleport
      v-if="mountPeekingOnHost && showPeeking"
      :to="peekingHostEl!"
    >
      <NavMenuCollapseTrigger
        :collapsed="isCollapsed"
        :position="collapseTriggerPosition"
        :label-variant="collapseLabelVariant"
        @toggle="handleCollapseToggle"
      />
    </Teleport>
  </template>
</template>
