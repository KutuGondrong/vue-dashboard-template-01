import { defineComponent, h } from 'vue';
import type { SidebarMenuItem } from '@/layouts/sidebar/stores/sidebarStore';

const FeatureMenuIcon = defineComponent({
  name: 'FeatureMenuIcon',
  render() {
    return h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': 2,
        d: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
      }),
    ]);
  },
});

/**
 * Sidebar items appended by make feature.
 * Add manual custom items in featureMenuItems.ts instead.
 */
export function buildGeneratedFeatureMenuItems(_t: (key: string) => string): SidebarMenuItem[] {
  return [];
}

export { FeatureMenuIcon };
