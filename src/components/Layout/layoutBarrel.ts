export { default as Divider } from './Divider.vue';
export { default as Flex } from './Flex.vue';
export { default as Masonry } from './Masonry.vue';
export { default as Space } from './Space.vue';

import Divider from './Divider.vue';
import Flex from './Flex.vue';
import GridRoot from './Grid.vue';
import GridItem from './GridItem.vue';
import LayoutRoot from './Layout.vue';
import LayoutContent from './LayoutContent.vue';
import LayoutFooter from './LayoutFooter.vue';
import LayoutHeader from './LayoutHeader.vue';
import LayoutSider from './LayoutSider.vue';
import Masonry from './Masonry.vue';
import Space from './Space.vue';
import SplitterRoot from './Splitter.vue';
import SplitterPanel from './SplitterPanel.vue';

export const Grid = Object.assign(GridRoot, { Item: GridItem });
export { GridItem };

export const Layout = Object.assign(LayoutRoot, {
  Header: LayoutHeader,
  Footer: LayoutFooter,
  Sider: LayoutSider,
  Content: LayoutContent,
});
export { LayoutContent, LayoutFooter, LayoutHeader, LayoutSider };

export const Splitter = Object.assign(SplitterRoot, { Panel: SplitterPanel });
export { SplitterPanel };

export const LAYOUT_COMPONENT_MAP = {
  divider: Divider,
  flex: Flex,
  grid: Grid,
  layout: Layout,
  masonry: Masonry,
  space: Space,
  splitter: Splitter,
} as const;

export type LayoutComponentKey = keyof typeof LAYOUT_COMPONENT_MAP;

export type {
  DividerOrientation,
  DividerVariant,
  DividerLabelPosition,
  FlexDirection,
  FlexWrap,
  FlexJustify,
  FlexAlign,
  SpaceDirection,
  SpaceSize,
  SpaceAlign,
  SplitterDirection,
  SplitterPanelProps,
} from './layout.types';
