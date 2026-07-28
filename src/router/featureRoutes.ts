import type { RouteRecordRaw } from 'vue-router';

import { generatedFeatureRoutes } from '@/router/featureRoutesGenerate';

/**
 * Manual feature routes — edit here for custom wiring.
 * Generated routes from make feature live in featureRoutesGenerate.ts.
 * Spread into protectedChildren in src/router/index.ts.
 */
export const featureRoutes: RouteRecordRaw[] = [...generatedFeatureRoutes];
