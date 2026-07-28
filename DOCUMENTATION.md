# Architecture & Developer Documentation

> **Published template:** This guide describes the Vue starter you cloned. Interactive Documentation and Components open from the DEV sidebar landings (or the [live preview](https://template.teristimewa.com/vue-dashboard-template-01)).

**Choose language / Pilih Bahasa:**

- English (this document)
- [Bahasa Indonesia](./DOCUMENTATION.id.md)

> **This is the deep developer guide** - architecture, patterns, code samples, and step-by-step implementation. For prerequisites, quick start, Makefile commands, and scaffolding commands, start with [README.md](./README.md).

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Live Links & External Resources](#2-live-links--external-resources)
3. [Tech Stack & Dependencies](#3-tech-stack--dependencies)
4. [Getting Started (README)](#4-getting-started-readme)
5. [Application Bootstrap](#5-application-bootstrap)
6. [Global State (Pinia)](#6-global-state-pinia)
7. [Routing Architecture](#7-routing-architecture)
8. [Project Structure](#8-project-structure)
9. [Feature Module Pattern](#9-feature-module-pattern)
10. [Reusable Component Library](#10-reusable-component-library)
11. [Pinia Feature Stores](#11-pinia-feature-stores)
12. [Data Layer & API Implementation](#12-data-layer--api-implementation)
13. [i18n & Theming](#13-i18n--theming)
14. [In-app Documentation (Overview & Tutorial)](#14-in-app-documentation-overview--tutorial)
15. [Create a New Page: Shortcut (`make feature`)](#15-create-a-new-page--shortcut-make-feature)
16. [Create a New Page: Manual Walkthrough](#16-create-a-new-page--manual-walkthrough)
17. [After `make generate`](#17-after-make-generate)
18. [Deployment](#18-deployment)

---

## 1. Project Overview

This repository is a **production-ready Vue dashboard starter** built with **Vite**, **TypeScript**, **Tailwind CSS**, **Pinia**, and **Clean Layered Architecture**.

The app is organized into clear layers so UI, business logic, and network code stay separated:

```
Presentation   → pages, layouts, shared components
Application    → Pinia stores, usecases
Domain         → model types, mappers, payloads
Infrastructure → Axios, localStorage, config, router
```

**Data flow (end to end):**

```
Page → Component → Pinia store → Usecase → apiRepository / apiSource → Axios (backendService)
                              ↓
                         model.map.ts (snake_case API → camelCase UI)
```

**Dependency rules:**

| Layer                                           | May import                               |
| ----------------------------------------------- | ---------------------------------------- |
| Presentation (`pages`, `components`, `layouts`) | Application, Domain, Infrastructure      |
| Application (`stores`, `usecase`)               | Domain, Infrastructure                   |
| Domain (`models/`)                              | Nothing from Presentation or Application |

**Demo login (development mock):** `admin@mail.com` / `password123`

---

## 2. Live Links & External Resources

URLs are centralized in `src/config/external-links.json`:

| Key               | Purpose                                             |
| ----------------- | --------------------------------------------------- |
| `templateRepoUrl` | Git clone URL for end users                         |
| `readmeUrl`       | Short project overview on GitHub                    |
| `tutorialUrl`     | Published documentation (`/documentation/overview`) |
| `componentsUrl`   | Published component catalog (`/components`)         |

**Live template preview:** [https://template.teristimewa.com/vue-dashboard-template-01](https://template.teristimewa.com/vue-dashboard-template-01)

### Sidebar menu (end-user navigation)

When you run `make dev`, the protected area shows these main menu items:

| Menu key              | Route            | Feature                                                 |
| --------------------- | ---------------- | ------------------------------------------------------- |
| Dashboard             | `/dashboard`     | Stats cards, charts                                     |
| Users                 | `/users`         | Paginated table, CRUD drawers                           |
| Settings              | `/settings`      | App preferences, theme                                  |
| Documentation _(DEV)_ | `/documentation` | Landing → `tutorialUrl` (published docs)                |
| Components _(DEV)_    | `/components`    | Landing → `componentsUrl` (published component catalog) |

In development, **Documentation** and **Components** show a DEV badge. Production builds (`make build`) omit those landings. Hide them during dev with `VITE_SHOW_DEV_FEATURES=false` in `.env` or `.env.development`.

Step-by-step interactive guides (Overview, Tutorial, Preview) live on the [live preview](https://template.teristimewa.com/vue-dashboard-template-01/documentation/overview).

---

## 3. Tech Stack & Dependencies

Pinned via [Volta](https://volta.sh) in `package.json`. Also set via `packageManager` for Corepack:

| Tool    | Version                 |
| ------- | ----------------------- |
| Node.js | `22.23.1` (recommended) |
| pnpm    | `11.17.0` (recommended) |

Recommended pins stay aligned in `package.json` (`volta`, `packageManager`, `engines`). After `cd` into the repo, Volta switches both tools automatically.

**Enable Volta’s pnpm support** (once per machine if you use Volta):

- **Full OS guide:** [VOLTA.md](./VOLTA.md) (macOS zsh/bash, Linux/WSL bash/zsh, Windows PowerShell; troubleshooting for empty `VOLTA_FEATURE_PNPM` and PATH shadowing by nvm)
- **Without Volta:** still install Node **22.23.1** and pnpm **11.17.0** yourself - see [VOLTA.md - Without Volta](./VOLTA.md#without-volta)
- Short macOS path: [README → Enable Volta](./README.md#enable-volta-recommended)

```bash
# 1. Install Volta (if needed)
curl https://get.volta.sh | bash
# reopen terminal

# 2. Append at END of ~/.zshrc (after nvm/fnm/asdf); use ~/.bashrc on bash Linux
cat >> ~/.zshrc <<'EOF'

# Volta (keep at end of file so it wins over nvm/fnm/asdf)
export VOLTA_FEATURE_PNPM=1
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
EOF
source ~/.zshrc
echo "$VOLTA_FEATURE_PNPM"   # expect: 1

# 3. Install pins (once per machine; no volta pin needed if package.json has volta)
volta install node@22.23.1 pnpm@11.17.0
which node                   # expect: ~/.volta/bin/node
```

On Windows, set a user environment variable `VOLTA_FEATURE_PNPM=1` (see [VOLTA.md - Windows PowerShell](./VOLTA.md#5-windows--powershell)), then open a new terminal and run `volta install node@22.23.1 pnpm@11.17.0`.

Approved dependency build scripts live in `pnpm-workspace.yaml` (`allowBuilds.esbuild` / `allowBuilds.vue-demi` = `true`). Without those entries, `pnpm install` fails with `ERR_PNPM_IGNORED_BUILDS`.

### Runtime dependencies

| Package      | Role                                             |
| ------------ | ------------------------------------------------ |
| `vue`        | UI rendering (Composition API, `<script setup>`) |
| `vue-router` | Client-side routing, lazy routes                 |
| `pinia`      | Global and feature state                         |
| `axios`      | HTTP client (via `backendService`)               |

### Dev dependencies

| Package               | Role                            |
| --------------------- | ------------------------------- |
| `typescript`          | Static typing                   |
| `vite`                | Dev server & production bundler |
| `@vitejs/plugin-vue`  | Vue SFC support                 |
| `tailwindcss`         | Utility-first CSS               |
| `eslint` + `prettier` | Linting and formatting          |
| `vue-tsc`             | Vue TypeScript check            |

**Path alias:** `@/*` → `src/*` (configured in `tsconfig.json` and `vite.config.ts`).

---

## 4. Getting Started (README)

**Not covered here** (see [README.md](./README.md)):

| Topic                                     | README section                                                                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Prerequisites & per-OS install            | [Prerequisites](./README.md#prerequisites) · [Enable Volta](./README.md#enable-volta-recommended) · **[VOLTA.md](./VOLTA.md)** |
| Clone, install, `make dev`                | [Quick Start](./README.md#quick-start)                                                                                         |
| `make generate` / `make feature` commands | [Scaffolding](./README.md#scaffolding)                                                                                         |
| Without Make (`pnpm`, `node scripts/…`)   | [Without Make](./README.md#without-make)                                                                                       |
| Makefile reference                        | [Commands](./README.md#commands-makefile)                                                                                      |
| Environment variable summary              | [Environment](./README.md#environment)                                                                                         |

This document assumes the app is running locally. Demo login: `admin@mail.com` / `password123`.

---

## 5. Application Bootstrap

### `src/main.ts`: entry point

```ts
const app = createApp(App);
app.use(pinia);
app.use(router);
installRouterBridge(router);

authStore.initAuth();
themeStore.initTheme();

app.mount('#app');
```

Loads global styles (`index.css`), registers Pinia and Vue Router, initializes auth and theme from `localSource`.

### `src/App.vue`: root shell

```vue
<AppErrorBoundary>
  <ToastHost>
    <ModalHost>
      <RouterView v-if="!authStore.isBootstrapping" />
      <!-- loading spinner while auth bootstraps -->
    </ModalHost>
  </ToastHost>
</AppErrorBoundary>
```

**Order matters:** `AppErrorBoundary` catches render errors. `ToastHost` and `ModalHost` provide global toast and modal UI. `RouterView` renders the matched route after auth bootstrap completes.

Unlike React context providers, **locale and theme** are Pinia stores initialized in `main.ts`. Auth is also a Pinia store (`useAuthStore`), not a wrapper component.

---

## 6. Global State (Pinia)

Global state lives in Pinia stores. Feature-specific state lives in `src/features/<name>/stores/`.

### Store reference

| Store            | File                                    | Composable        | Responsibility                                        |
| ---------------- | --------------------------------------- | ----------------- | ----------------------------------------------------- |
| `useLocaleStore` | `locales/localeStore.ts`                | `useLocale()`     | `t(key, params?)`, `locale`, `setLocale`              |
| `useAuthStore`   | `features/auth/stores/authStore.ts`     | `useAuthStore()`  | `user`, `token`, `login`, `logout`, `isAuthenticated` |
| `useThemeStore`  | `core/stores/themeStore.ts`             | `useThemeStore()` | `mode`, `resolvedTheme`, `setMode`, `toggleTheme`     |
| `useToastStore`  | `components/Toast/stores/toastStore.ts` | `useToastStore()` | Show success/error/info toasts                        |
| `useModalStore`  | `components/Modal/stores/modalStore.ts` | `useModalStore()` | Confirm dialogs                                       |

### `useLocale()` example

```vue
<script setup lang="ts">
import { useLocale } from '@/locales/localeStore';

const { t, locale, setLocale } = useLocale();
</script>

<template>
  <p>{{ t('users.deleteMessage', { name: 'John Doe' }) }}</p>
</template>
```

### `useAuthStore()` example

```ts
import { useAuthStore } from '@/features/auth/stores/authStore';

const authStore = useAuthStore();
await authStore.login({ email: 'admin@mail.com', password: 'password123' });
authStore.logout();
```

### `useThemeStore()` example

```ts
import { useThemeStore } from '@/core/stores/themeStore';

const themeStore = useThemeStore();
themeStore.setMode('dark'); // 'light' | 'dark' | 'system'
themeStore.toggleTheme();
```

### Toast and modal

```ts
import { useToastStore } from '@/components/Toast';
import { useModalStore } from '@/components/Modal';

const toastStore = useToastStore();
toastStore.showToast({ type: 'success', title: 'Saved successfully' });

const modalStore = useModalStore();
const confirmed = await modalStore.confirm({
  title: 'Delete user?',
  message: 'This action cannot be undone.',
  variant: 'danger',
});
```

---

## 7. Routing Architecture

Routes are defined in `src/router/index.ts`. Feature routes live in `src/router/featureRoutes.ts` and are spread into `protectedChildren` via `...featureRoutes`.

### Layout structure

```
/  (requires auth + MainLayout)
├── /dashboard
├── /users
├── /settings
├── /documentation              (DEV: landing → tutorialUrl)
└── /components                 (DEV: landing → componentsUrl)

/  (guest + AuthLayout)
├── /login
└── /register

* → NotFoundPage (404)
```

### Route guards

`router.beforeEach` in `index.ts` checks `useAuthStore().isAuthenticated` and redirects unauthenticated users to `/login`. Authenticated users on `/login` or `/register` are redirected to `/dashboard`.

### Code splitting

Pages load via `lazyPage()` which wraps dynamic imports with retry logic:

```ts
const UsersPage = lazyPage(() => import('@/features/users/pages/UsersPage'));
```

`lazyPage` is used for all route components. `SkeletonLoader` appears while chunks load.

### Basename (subpath deploy)

`routerBasename` comes from `src/config/basePath.ts` (reads `import.meta.env.BASE_URL`). Set `VITE_BASE_PATH` when the app is served under a subpath (see [Deployment](#18-deployment)).

---

## 8. Project Structure

```
vue-app/
├── public/                    # Static assets (logos, favicon, samples/)
├── scripts/
│   ├── generate-app.mjs       # make generate
│   └── generate-feature.mjs   # make feature
├── src/
│   ├── main.ts                # Vue entry
│   ├── App.vue                # Root shell
│   ├── index.css              # Tailwind directives + global styles
│   │
│   ├── config/
│   │   ├── app.config.ts      # Title, API URL, locale defaults, pagination
│   │   ├── basePath.ts        # Asset URL helper, router basename
│   │   ├── color.tokens.ts    # Design tokens
│   │   ├── devFeatures.ts     # Documentation / Components toggle
│   │   └── external-links.json
│   │
│   ├── core/
│   │   ├── router/routerBridge.ts  # Router access outside setup()
│   │   └── stores/themeStore.ts
│   │
│   ├── router/
│   │   ├── index.ts           # Core route definitions
│   │   ├── featureRoutes.ts   # Feature route registry (make feature)
│   │   └── lazyPage.ts        # Lazy import helper
│   │
│   ├── locales/
│   │   ├── en.json            # English UI strings
│   │   ├── id.json            # Indonesian UI strings
│   │   ├── messages.ts        # Bundled locale imports
│   │   └── localeUtils.ts     # translateMessage(), {{param}} interpolation
│   │
│   ├── models/
│   │   ├── model.response.ts  # Raw API JSON shapes (snake_case)
│   │   ├── model.type.ts      # UI types (camelCase)
│   │   ├── model.map.ts       # API → UI mappers
│   │   └── model.payload.ts   # Partial update payloads
│   │
│   ├── datasource/
│   │   ├── local/localSource.ts
│   │   └── network/
│   │       ├── services/backendService.ts  # Axios + interceptors
│   │       ├── apiSource.ts                # REST endpoint calls
│   │       └── apiRepository.ts            # Mock auth + business logic
│   │
│   ├── components/            # Reusable UI library (20+ components)
│   ├── layouts/               # MainLayout, sidebar, header, footer
│   └── features/              # Domain modules (one folder per feature)
│       ├── auth/
│       ├── dashboard/
│       ├── users/
│       ├── settings/
│       ├── tutorial/          # Documentation landing (DEV) → tutorialUrl
│       └── storybook/         # Components landing (DEV) → componentsUrl
│
├── DOCUMENTATION.md           # This file (end-user developer guide)
├── DOCUMENTATION.id.md        # Bahasa Indonesia version
├── README.md
└── Makefile
```

### Standard feature folder layout

```
src/features/<name>/
├── pages/<Name>Page.vue       # Route entry: title + composes table
├── components/                # Feature-specific UI (tables, forms)
├── stores/<name>Store.ts      # Pinia: fetch state, pagination, filters
└── usecase/<name>Usecase.ts   # Business logic → repository / apiSource
```

`scope=page` from `make feature` generates only `pages/` plus router/menu/locale wiring.

---

## 9. Feature Module Pattern

Each feature follows the same layered pattern. The **Users** feature ships with this template and is the reference for full CRUD. **Inventory** is the Tutorial example (table + filters + mock data).

### Layer responsibilities

| File              | Layer        | Does                                         |
| ----------------- | ------------ | -------------------------------------------- |
| `UsersPage.vue`   | Presentation | Page shell, title, composes `<UsersTable />` |
| `UsersTable.vue`  | Presentation | Columns, DataTable, Pagination, drawers      |
| `usersStore.ts`   | Application  | Pinia: fetch state, pagination, selection    |
| `usersUsecase.ts` | Application  | Async operations, delegates to repository    |

### Example: thin page

```vue
<script setup lang="ts">
import { useLocale } from '@/locales/localeStore';
import { Typography } from '@/components/Typography';
import UsersTable from '@/features/users/components/UsersTable.vue';

const { t } = useLocale();
</script>

<template>
  <div class="space-y-6">
    <Typography.Title :level="2">{{ t('nav.users') }}</Typography.Title>
    <Typography.Text color="muted" class="mt-1 block">
      {{ t('users.subtitle') }}
    </Typography.Text>
    <UsersTable />
  </div>
</template>
```

**Rule:** Pages stay thin. No `axios`, no `localStorage`, no direct API calls in pages or table components.

---

## 10. Reusable Component Library

All shared UI lives in `src/components/`. Built with Tailwind CSS and tokens from `src/config/color.tokens.ts`.

### Component catalog

| Component          | Import                          | Typical use                   |
| ------------------ | ------------------------------- | ----------------------------- |
| `Button`           | `@/components/Button`           | Actions, form submit          |
| `Input`            | `@/components/Input`            | Text fields, validation       |
| `ComboBox`         | `@/components/ComboBox`         | Searchable select             |
| `DataTable`        | `@/components/DataTable`        | Sortable tables with loading  |
| `Pagination`       | `@/components/Pagination`       | Page navigation               |
| `Modal`            | `@/components/Modal`            | Confirm dialogs               |
| `Drawer`           | `@/components/Drawer`           | Side panels                   |
| `Toast`            | `@/components/Toast`            | Notifications                 |
| `Badge`            | `@/components/Badge`            | Status chips                  |
| `Card`             | `@/components/Card`             | Content containers            |
| `Avatar`           | `@/components/Avatar`           | User avatars                  |
| `Toggle`           | `@/components/Toggle`           | Boolean switches              |
| `Typography`       | `@/components/Typography`       | Title, Text, Paragraph        |
| `Chart`            | `@/components/Chart`            | Bar, Line, Donut, MetricCard  |
| `FileManagement`   | `@/components/FileManagement`   | Upload / download             |
| `Layout`           | `@/components/Layout`           | Grid, Flex, Masonry, Splitter |
| `NavMenu`          | `@/components/NavMenu`          | Sidebar navigation tree       |
| `SkeletonLoader`   | `@/components/SkeletonLoader`   | Loading placeholders          |
| `ScrollToTop`      | `@/components/ScrollToTop`      | Scroll container + anchor     |
| `CodeBlock`        | `@/components/CodeBlock`        | Syntax-highlighted code       |
| `AppErrorBoundary` | `@/components/AppErrorBoundary` | Error recovery screen         |

### Where to browse components

| When                     | URL                                                                                                                                    |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| **`make dev` (sidebar)** | **Components** (DEV badge) → opens `componentsUrl`                                                                                     |
| **Live catalog**         | [template.teristimewa.com/vue-dashboard-template-01/components](https://template.teristimewa.com/vue-dashboard-template-01/components) |

The live catalog shows props, state matrix, and copy-paste code samples.

### Component locale rule

Default text inside `src/components/` uses `t('components.common.*')` from `src/components/locales/en.json` and `id.json`. Feature-specific copy goes in `src/locales/`.

---

## 11. Pinia Feature Stores

Feature stores are the **Application layer** bridge between UI and business logic.

### Feature store pattern

A typical list store owns **UI state** and **data fetching**:

```ts
export const useInventoryStore = defineStore('inventory', () => {
  const items = ref<InventoryItem[]>([]);
  const isLoading = ref(true);
  const page = ref(1);
  const pageSize = ref(appConfig.paginationDefaultPageSize);

  async function fetchItems(): Promise<void> {
    isLoading.value = true;
    try {
      const result = await inventoryUsecase.getItems(page.value, pageSize.value);
      items.value = result.data;
      totalPages.value = result.totalPages;
      totalItems.value = result.total;
    } finally {
      isLoading.value = false;
    }
  }

  watch([page, pageSize], () => {
    void fetchItems();
  });

  return { items, isLoading, page, setPage, pageSize, onPageSizeChange, init };
});
```

**Conventions:**

- `ref` + `watch` for async lists
- Call **usecase**, never `axios` or `apiSource` directly from stores
- Table components call `store.init()` in `onMounted`
- Export item types from the store file when feature-specific

### Store rules (do / don't)

| Do                                      | Don't                                  |
| --------------------------------------- | -------------------------------------- |
| Call usecase from stores                | Call `axios` or `fetch` in stores      |
| Keep pages thin, delegate to stores     | Put business rules in table components |
| Use global stores for auth/locale/theme | Duplicate auth logic per feature       |

---

## 12. Data Layer & API Implementation

### Three network layers

```
backendService.ts   → Axios instance, base URL, Bearer token, 401 interceptor
apiSource.ts        → One function per REST endpoint (returns raw API JSON)
apiRepository.ts    → Business logic, validation, mock data, calls mappers
```

Feature usecases call `apiRepository` (or `apiSource` + mappers when wiring a real backend).

### Models: anti-corruption layer

| File                | Format              | Example field                    |
| ------------------- | ------------------- | -------------------------------- |
| `model.response.ts` | snake_case (API)    | `full_name`, `is_active`         |
| `model.type.ts`     | camelCase (UI)      | `fullName`, `isActive`           |
| `model.map.ts`      | Transform functions | `toUser()`, `toPaginatedUsers()` |

**Rule:** Components and stores never see `snake_case` API fields.

### `localSource.ts`: storage abstraction

Never use `localStorage` directly. Use `localSource`:

```ts
localSource.getToken();
localSource.setUser(user);
localSource.getTheme();
localSource.setLocale('id');
localSource.clearAuth();
```

### Current state: mock vs real API

| Feature                          | Current data source                       |
| -------------------------------- | ----------------------------------------- |
| Auth (login/register)            | Mock in `apiRepository.ts`                |
| Users list                       | Mock in `apiRepository.ts`                |
| Dashboard                        | Mock in `dashboardUsecase.ts`             |
| New features from `make feature` | Mock in `<name>Usecase.ts` (scope `full`) |

`apiSource.ts` defines real endpoint shapes for when you connect a backend.

### How to wire a real API (Users example)

**Step 1:** Set `VITE_API_BASE_URL` in `.env`.

**Step 2:** Replace mock in `apiRepository.ts`:

```ts
async getUsers(page: number, pageSize: number): Promise<PaginatedResult<User>> {
  const response = await apiSource.getUsers(page, pageSize);
  return toPaginatedUsers(response);
},
```

**Step 3:** No changes needed in usecase, store, or page.

For a **new page** (e.g. Inventory from the Tutorial), follow [Section 16 Step 11](#step-11--connect-real-api-when-backend-is-ready) or the in-app Tutorial step 5.

---

## 13. i18n & Theming

### Locales

| File                  | Language         |
| --------------------- | ---------------- |
| `src/locales/en.json` | English          |
| `src/locales/id.json` | Bahasa Indonesia |

Both files must share the **same key structure**. Parameter names in `{{param}}` must match across locales; word order can differ.

Default locale: `'en'` in `src/config/app.config.ts`.

### Theme

`useThemeStore` supports `light`, `dark`, and `system`. Persists to localStorage via `localSource`. Toggle in header via theme button.

To change brand colors, edit `src/config/color.tokens.ts` and keep `tailwind.config.js` in sync.

### App branding

Replace `public/logo-light.svg` and `public/logo-dark.svg`. Update `title`, `description.en`, `description.id`, and logo paths in `src/config/app.config.ts`. See Tutorial step 6 (branding) or [Section 14](#14-in-app-documentation-overview--tutorial).

---

## 14. In-app Documentation (Overview & Tutorial)

When you run `make dev`, the sidebar shows **Documentation** _(DEV)_ as a landing that opens `tutorialUrl` in `external-links.json` (published docs). **This `DOCUMENTATION.md` file** stays in the repo for offline reference.

The full step-by-step UI is on the [live preview](https://template.teristimewa.com/vue-dashboard-template-01/documentation/overview):

### Overview

| Step | Topic                                               |
| ---- | --------------------------------------------------- |
| 1    | Prerequisites + quick path (clone → generate → dev) |
| 2    | Clone template repository                           |
| 3    | `make generate` workflow                            |
| 4    | Localization (i18n)                                 |
| 5    | Environment variables (dev vs production)           |
| 6–8  | Links to Tutorial (add pages, branding, data layer) |

### Tutorial

| Step | Topic                                            |
| ---- | ------------------------------------------------ |
| 1    | Scaffold with `make feature` (Inventory example) |
| 2    | Create feature code manually (optional)          |
| 3    | Add menu and route manually (optional)           |
| 4    | Mock data (default)                              |
| 5    | Connect real API (optional)                      |
| 6    | Customize logo and app title                     |

### Preview

Live **Inventory** page - same structure as `make feature name=inventory scope=full`.

---

## 15. Create a New Page: Shortcut (`make feature`)

The fastest way to add sidebar menu, route, locale keys, and feature folder:

```bash
make feature name=inventory label="Inventory" label-id="Inventaris"
```

### Scope

| Scope              | Generated                         | Mock data         |
| ------------------ | --------------------------------- | ----------------- |
| `full` _(default)_ | page, table, Pinia store, usecase | in `usecase/*.ts` |
| `store`            | page, table, Pinia store          | inline in store   |
| `page`             | page only                         | none              |

### Parameters

| Parameter  | Required    | Description                                                                |
| ---------- | ----------- | -------------------------------------------------------------------------- |
| `name`     | Yes         | Feature key → `src/features/<name>/`, route `/<name>`, locale `nav.<name>` |
| `label`    | Recommended | English sidebar label → `en.json`                                          |
| `label-id` | Recommended | Indonesian sidebar label → `id.json`                                       |
| `scope`    | No          | `full` · `store` · `page` (alias: `empty`)                                 |

### Examples

```bash
make feature name=reports scope=store label="Reports" label-id="Laporan"
make feature name=alerts scope=page label="Alerts" label-id="Peringatan"
```

### Files touched automatically

1. `src/features/<name>/pages/<Name>Page.vue`
2. `src/features/<name>/components/<Name>Table.vue` _(full / store)_
3. `src/features/<name>/stores/<name>Store.ts` _(full / store)_
4. `src/features/<name>/usecase/<name>Usecase.ts` _(full only)_
5. `src/router/featureRoutes.ts`
6. `src/layouts/sidebar/featureMenuItems.ts`
7. `src/locales/en.json` + `id.json` (`nav.*`, `<name>.subtitle`)

Open the **Tutorial** tab for live code samples and the Inventory preview.

---

## 16. Create a New Page: Manual Walkthrough

Use this when you need full control or want to understand what `make feature` does. We create a **Products** page with mock data, then optionally wire a real API.

### Step 1: Create feature folder structure

```
src/features/products/
├── pages/ProductsPage.vue
├── components/ProductsTable.vue
├── stores/productsStore.ts
└── usecase/productsUsecase.ts
```

### Step 2: Add locale keys

```json
// src/locales/en.json - under "nav"
"products": "Products"

// new section
"products": {
  "subtitle": "Manage your product catalog"
}
```

```json
// src/locales/id.json - under "nav"
"products": "Produk"

"products": {
  "subtitle": "Kelola katalog produk Anda"
}
```

### Step 3: Create the page

```vue
<script setup lang="ts">
import { useLocale } from '@/locales/localeStore';
import { Typography } from '@/components/Typography';
import ProductsTable from '@/features/products/components/ProductsTable.vue';

const { t } = useLocale();
</script>

<template>
  <div class="space-y-6">
    <Typography.Title :level="2">{{ t('nav.products') }}</Typography.Title>
    <Typography.Text color="muted" class="mt-1 block">
      {{ t('products.subtitle') }}
    </Typography.Text>
    <ProductsTable />
  </div>
</template>
```

### Step 4: Create the usecase (mock first)

```ts
// src/features/products/usecase/productsUsecase.ts
import type { PaginatedResult } from '@/models/model.type';
import type { ProductItem } from '@/features/products/stores/productsStore';

const MOCK_ITEMS: ProductItem[] = [
  { id: 'prd_001', name: 'Product A', isActive: true },
  { id: 'prd_002', name: 'Product B', isActive: false },
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const productsUsecase = {
  async getItems(page: number, pageSize: number): Promise<PaginatedResult<ProductItem>> {
    await delay(500);
    const start = (page - 1) * pageSize;
    return {
      data: MOCK_ITEMS.slice(start, start + pageSize),
      total: MOCK_ITEMS.length,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(MOCK_ITEMS.length / pageSize)),
    };
  },
};
```

### Step 5: Create the Pinia store

```ts
// src/features/products/stores/productsStore.ts
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { appConfig } from '@/config/app.config';
import { productsUsecase } from '@/features/products/usecase/productsUsecase';

export interface ProductItem {
  id: string;
  name: string;
  isActive: boolean;
}

export const useProductsStore = defineStore('products', () => {
  const items = ref<ProductItem[]>([]);
  const isLoading = ref(true);
  const page = ref(1);
  const pageSize = ref(appConfig.paginationDefaultPageSize);
  const totalPages = ref(1);
  const totalItems = ref(0);

  async function fetchItems(): Promise<void> {
    isLoading.value = true;
    try {
      const result = await productsUsecase.getItems(page.value, pageSize.value);
      items.value = result.data;
      totalPages.value = result.totalPages;
      totalItems.value = result.total;
    } finally {
      isLoading.value = false;
    }
  }

  watch([page, pageSize], () => {
    void fetchItems();
  });

  function setPage(nextPage: number) {
    page.value = nextPage;
  }
  function onPageSizeChange(size: number) {
    pageSize.value = size;
    page.value = 1;
  }
  function init() {
    void fetchItems();
  }

  return {
    items,
    isLoading,
    page,
    setPage,
    pageSize,
    totalPages,
    totalItems,
    onPageSizeChange,
    init,
  };
});
```

### Step 6: Create the table component

```vue
<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useLocale } from '@/locales/localeStore';
import type { TableColumn } from '@/models/model.type';
import { useProductsStore, type ProductItem } from '@/features/products/stores/productsStore';
import { DataTable, DataTableGroup } from '@/components/DataTable';
import { Pagination } from '@/components/Pagination';
import Badge from '@/components/Badge/Badge.vue';

const { t } = useLocale();
const store = useProductsStore();
const { items, isLoading, page, pageSize, totalPages, totalItems } = storeToRefs(store);
const { setPage, onPageSizeChange } = store;

onMounted(() => store.init());

const columns = computed<TableColumn<ProductItem>[]>(() => [
  { key: 'name', header: t('components.common.name') },
  { key: 'isActive', header: t('components.common.status') },
]);
</script>

<template>
  <DataTableGroup>
    <DataTable unwrapped :data="items" :columns="columns" :is-loading="isLoading">
      <template #isActive="{ item }">
        <Badge :variant="item.isActive ? 'success' : 'danger'" :dot="true">
          {{ item.isActive ? t('components.common.active') : t('components.common.inactive') }}
        </Badge>
      </template>
    </DataTable>
    <template #footer>
      <Pagination
        :current-page="page"
        :total-pages="totalPages"
        :page-size="pageSize"
        :total-items="totalItems"
        @page-change="setPage"
        @page-size-change="onPageSizeChange"
      />
    </template>
  </DataTableGroup>
</template>
```

See `src/features/inventory/components/InventoryTable.vue` for filters and advanced column patterns.

### Step 7: Register the route

Append to `src/router/featureRoutes.ts`:

```ts
import { lazyPage } from '@/router/lazyPage';

const ProductsPage = lazyPage(() => import('@/features/products/pages/ProductsPage.vue'));

export const featureRoutes = [
  {
    path: 'products',
    name: 'products',
    component: ProductsPage,
  },
];
```

Ensure `...featureRoutes` is spread in `protectedChildren` inside `src/router/index.ts` (already set up in this template).

### Step 8: Add sidebar menu item

Append inside `buildFeatureMenuItems()` in `src/layouts/sidebar/featureMenuItems.ts`:

```ts
{
  key: 'products',
  label: t('nav.products'),
  path: '/products',
  icon: h(FeatureMenuIcon),
},
```

### Step 9: Verify in browser

```bash
make dev
```

Navigate to `/products`. You should see the table with mock data and working pagination.

### Step 11: Connect real API (when backend is ready)

<a id="step-11--connect-real-api-when-backend-is-ready"></a>

**Step 1:** Set `VITE_API_BASE_URL` in `.env`.

**Step 2:** Add API response type in `model.response.ts` (snake_case):

```ts
export interface ApiInventoryItemResponse {
  id: string;
  name: string;
  is_active: boolean;
}
```

**Step 3:** Add domain type in `model.type.ts` (camelCase):

```ts
export interface InventoryItem {
  id: string;
  name: string;
  isActive: boolean;
}
```

**Step 4:** Add mapper in `model.map.ts`:

```ts
export function toInventoryItem(api: ApiInventoryItemResponse): InventoryItem {
  return { id: api.id, name: api.name, isActive: api.is_active };
}
```

**Step 5:** Add endpoint in `apiSource.ts`:

```ts
async getInventory(page: number, pageSize: number): Promise<ApiInventoryListResponse> {
  const response = await backendService.get('/inventory', {
    params: { page, page_size: pageSize },
  });
  return response.data;
},
```

**Step 6:** Replace mock in `inventoryUsecase.ts`:

```ts
import { apiSource } from '@/datasource/network/apiSource';
import { toPaginatedInventory } from '@/models/model.map';

export const inventoryUsecase = {
  async getItems(page: number, pageSize: number, filters?: InventoryFilters) {
    const response = await apiSource.getInventory(page, pageSize);
    return toPaginatedInventory(response);
  },
};
```

The Pinia store (`inventoryStore`) and page (`InventoryPage`) require **no changes**.

---

## 17. After `make generate`

Command syntax and first-run steps are in [README.md - Scaffolding](./README.md#scaffolding). What changes **architecturally** in the output app:

| Setting / file                             | Effect                                                           |
| ------------------------------------------ | ---------------------------------------------------------------- |
| `app.config.ts` → `isBoilerplate: false`   | Sidebar shows Documentation **landing** (links to `tutorialUrl`) |
| `enableDevFeaturesInProduction: false`     | Production build omits Documentation & Components landings       |
| `DOCUMENTATION.md` / `DOCUMENTATION.id.md` | This deep guide ships in the generated app                       |
| Scaffolding                                | `make generate` / `make feature` remain available                |
| `git init`                                 | Fresh repository in the output folder                            |

Customize `title`, logos, and `external-links.json` in the generated app before your first deploy.

---

## 18. Deployment

| Variable                    | Default      | Purpose                                        |
| --------------------------- | ------------ | ---------------------------------------------- |
| `VITE_API_BASE_URL`         | `/api`       | Backend API base URL                           |
| `VITE_BASE_PATH`            | `/`          | Base path when served under a subpath          |
| `VITE_SHOW_DEV_FEATURES`    | `true` (dev) | Show Documentation & Components landing routes |
| `VITE_ENABLE_SCROLL_TO_TOP` | `true`       | Scroll-to-top button on all pages              |

`.env` holds defaults. `.env.development` (`make dev`) and `.env.production` (`make build`) override per mode when values differ.

**Subpath hosting:** Set `VITE_BASE_PATH` before `make build`. Configure SPA fallback on your web server so deep links resolve to `index.html`.

**Production build:**

```bash
make build    # or: pnpm format && pnpm build
make preview  # optional local check of dist/
```

---

## Further Reading

- [README.md](./README.md): quick start, prerequisites, Makefile, scaffolding commands
- [DOCUMENTATION.id.md](./DOCUMENTATION.id.md): this guide in Bahasa Indonesia
- [README.id.md](./README.id.md): ringkasan singkat (Bahasa Indonesia)
- [Component catalog (live)](https://template.teristimewa.com/vue-dashboard-template-01/components)
- [Documentation (live)](https://template.teristimewa.com/vue-dashboard-template-01/documentation/overview)
