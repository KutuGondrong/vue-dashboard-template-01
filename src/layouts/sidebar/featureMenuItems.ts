import type { SidebarMenuItem } from '@/layouts/sidebar/stores/sidebarStore';
import { buildGeneratedFeatureMenuItems } from '@/layouts/sidebar/featureMenuItemsGenerate';

export { FeatureMenuIcon } from '@/layouts/sidebar/featureMenuItemsGenerate';

/**
 * Manual sidebar menu items — edit here for custom entries.
 * Generated items from make feature live in featureMenuItemsGenerate.ts.
 * Merged into sidebarStore via buildFeatureMenuItems().
 */
export function buildFeatureMenuItems(t: (key: string) => string): SidebarMenuItem[] {
  return [...buildGeneratedFeatureMenuItems(t)];
}
