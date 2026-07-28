import { createRouter, createWebHistory } from 'vue-router';
import { routerBasename } from '@/config/basePath';
import { isDevFeaturesEnabled } from '@/config/devFeatures';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { featureRoutes } from '@/router/featureRoutes';
import { lazyPage } from '@/router/lazyPage';

const MainLayout = lazyPage(() => import('@/layouts/main-layout/components/MainLayout.vue'));
const AuthLayout = lazyPage(() => import('@/layouts/main-layout/components/AuthLayout.vue'));

const LoginPage = lazyPage(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazyPage(() => import('@/features/auth/pages/RegisterPage'));
const DashboardPage = lazyPage(() => import('@/features/dashboard/pages/DashboardPage'));
const UsersPage = lazyPage(() => import('@/features/users/pages/UsersPage'));
const SettingsPage = lazyPage(() => import('@/features/settings/pages/SettingsPage'));
const NotFoundPage = lazyPage(() => import('@/pages/NotFoundPage.vue'));

const TutorialLandingPage = isDevFeaturesEnabled
  ? lazyPage(() => import('@/features/tutorial/pages/TutorialLandingPage'))
  : null;

const StorybookLandingPage = isDevFeaturesEnabled
  ? lazyPage(() => import('@/features/storybook/pages/StorybookLandingPage'))
  : null;

const componentsRoutes = StorybookLandingPage
  ? [
      {
        path: 'components',
        name: 'components-landing',
        component: StorybookLandingPage,
      },
    ]
  : [];

const documentationRoutes = TutorialLandingPage
  ? [
      {
        path: 'documentation',
        name: 'documentation-landing',
        component: TutorialLandingPage,
      },
    ]
  : [];

const protectedChildren = [
  {
    path: '',
    redirect: { name: 'dashboard' },
  },
  {
    path: 'dashboard',
    name: 'dashboard',
    component: DashboardPage,
  },
  {
    path: 'users',
    name: 'users',
    component: UsersPage,
  },
  {
    path: 'settings',
    name: 'settings',
    component: SettingsPage,
  },
  ...featureRoutes,
  ...documentationRoutes,
  ...componentsRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundPage,
  },
];

const router = createRouter({
  history: createWebHistory(routerBasename),
  routes: [
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: protectedChildren,
    },
    {
      path: '/',
      component: AuthLayout,
      meta: { requiresGuest: true },
      children: [
        {
          path: 'login',
          name: 'login',
          component: LoginPage,
        },
        {
          path: 'register',
          name: 'register',
          component: RegisterPage,
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'not-found-fallback',
          component: NotFoundPage,
        },
      ],
    },
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (auth.isBootstrapping) {
    return true;
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }

  if (to.meta.requiresGuest && auth.isAuthenticated) {
    return { path: '/dashboard' };
  }

  return true;
});

export default router;
