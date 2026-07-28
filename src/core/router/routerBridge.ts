import type { Router } from 'vue-router';

let routerInstance: Router | null = null;

/** Register the app router once from main.ts — stores use getRouter() for navigation. */
export function installRouterBridge(router: Router): void {
  routerInstance = router;
}

export function getRouter(): Router {
  if (!routerInstance) {
    throw new Error('Router not initialized. Call installRouterBridge() from main.ts.');
  }
  return routerInstance;
}
