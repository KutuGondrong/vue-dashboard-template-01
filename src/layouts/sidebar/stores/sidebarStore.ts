import { computed, type Component } from 'vue';
import { defineStore } from 'pinia';
import { useLocaleStore } from '@/locales/localeStore';
import { isDevFeaturesEnabled } from '@/config/devFeatures';
import {
  DashboardIcon,
  SettingsIcon,
  StorybookIcon,
  TutorialIcon,
  UsersIcon,
} from '@/layouts/sidebar/components/SidebarIcons';
import { buildFeatureMenuItems } from '@/layouts/sidebar/featureMenuItems';

const DOCUMENTATION_BASE_PATH = '/documentation';
const COMPONENTS_PATH = '/components';

export interface SidebarMenuItem {
  key: string;
  label: string;
  path?: string;
  end?: boolean;
  icon?: Component;
  devBadge?: boolean;
  onClick?: () => void;
  parentClick?: 'expand' | 'navigate';
  children?: SidebarMenuItem[];
}

export const useSidebarStore = defineStore('sidebar', () => {
  const localeStore = useLocaleStore();

  const menuItems = computed<SidebarMenuItem[]>(() => {
    const items: SidebarMenuItem[] = [
      {
        key: 'dashboard',
        label: localeStore.t('nav.dashboard'),
        path: '/dashboard',
        icon: DashboardIcon,
      },
      {
        key: 'users',
        label: localeStore.t('nav.users'),
        path: '/users',
        icon: UsersIcon,
      },
    ];

    items.push(...buildFeatureMenuItems((key) => localeStore.t(key)));

    if (isDevFeaturesEnabled) {
      items.push({
        key: 'documentation',
        label: localeStore.t('nav.documentation'),
        path: DOCUMENTATION_BASE_PATH,
        end: true,
        icon: TutorialIcon,
        devBadge: true,
      });

      items.push({
        key: 'components',
        label: localeStore.t('nav.components'),
        path: COMPONENTS_PATH,
        end: true,
        icon: StorybookIcon,
        devBadge: true,
      });
    }

    items.push({
      key: 'settings',
      label: localeStore.t('nav.settings'),
      path: '/settings',
      icon: SettingsIcon,
    });

    return items;
  });

  return { menuItems };
});
