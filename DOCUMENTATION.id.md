# Dokumentasi Arsitektur & Pengembang

> **Template terpublikasi:** Panduan ini menjelaskan starter Vue yang Anda clone. Documentation dan Components interaktif dibuka dari landing sidebar DEV (atau [live preview](https://template.teristimewa.com/vue-dashboard-template-01)).

**Pilih Bahasa / Choose language:**

- [English](./DOCUMENTATION.md)
- Bahasa Indonesia (dokumen ini)

> **Ini panduan developer mendalam** - arsitektur, pola, contoh kode, dan implementasi langkah demi langkah. Untuk prasyarat, quick start, perintah Makefile, dan perintah scaffolding, mulai dari [README.id.md](./README.id.md).

---

## Daftar Isi

1. [Gambaran Proyek](#id-1-gambaran-proyek)
2. [Tautan Live & Sumber Daya Eksternal](#id-2-tautan-live--sumber-daya-eksternal)
3. [Tech Stack & Dependensi](#id-3-tech-stack--dependensi)
4. [Mulai dari README](#id-4-mulai-dari-readme)
5. [Bootstrap Aplikasi](#id-5-bootstrap-aplikasi)
6. [State Global (Pinia)](#id-6-state-global-pinia)
7. [Arsitektur Routing](#id-7-arsitektur-routing)
8. [Struktur Proyek](#id-8-struktur-proyek)
9. [Pola Modul Fitur](#id-9-pola-modul-fitur)
10. [Pustaka Komponen Reusable](#id-10-pustaka-komponen-reusable)
11. [Pinia Store Fitur](#id-11-pinia-store-fitur)
12. [Lapisan Data & Implementasi API](#id-12-lapisan-data--implementasi-api)
13. [i18n & Tema](#id-13-i18n--tema)
14. [Dokumentasi In-app (Overview & Tutorial)](#id-14-dokumentasi-in-app-overview--tutorial)
15. [Buat Halaman Baru: Shortcut (`make feature`)](#id-15-buat-halaman-baru--shortcut-make-feature)
16. [Buat Halaman Baru: Walkthrough Manual](#id-16-buat-halaman-baru--walkthrough-manual)
17. [Setelah `make generate`](#id-17-setelah-make-generate)
18. [Deployment](#id-18-deployment)

---

<a id="id-1-gambaran-proyek"></a>

## 1. Gambaran Proyek

Repositori ini adalah **starter dashboard Vue siap produksi** dengan **Vite**, **TypeScript**, **Tailwind CSS**, **Pinia**, dan **Clean Layered Architecture**.

Aplikasi dibagi ke lapisan yang jelas agar UI, logika bisnis, dan kode jaringan tetap terpisah:

```
Presentation   → pages, layouts, shared components
Application    → Pinia stores, usecases
Domain         → model types, mappers, payloads
Infrastructure → Axios, localStorage, config, router
```

**Alur data (ujung ke ujung):**

```
Page → Component → Pinia store → Usecase → apiRepository / apiSource → Axios (backendService)
                              ↓
                         model.map.ts (snake_case API → camelCase UI)
```

**Aturan dependensi:**

| Lapisan                                         | Boleh mengimpor                                |
| ----------------------------------------------- | ---------------------------------------------- |
| Presentation (`pages`, `components`, `layouts`) | Application, Domain, Infrastructure            |
| Application (`stores`, `usecase`)               | Domain, Infrastructure                         |
| Domain (`models/`)                              | Tidak boleh dari Presentation atau Application |

**Login demo (mock development):** `admin@mail.com` / `password123`

---

<a id="id-2-tautan-live--sumber-daya-eksternal"></a>

## 2. Tautan Live & Sumber Daya Eksternal

URL dikelola di `src/config/external-links.json`:

| Key               | Fungsi                                               |
| ----------------- | ---------------------------------------------------- |
| `templateRepoUrl` | URL clone Git untuk end user                         |
| `readmeUrl`       | Ringkasan proyek singkat di GitHub                   |
| `tutorialUrl`     | Dokumentasi terpublikasi (`/documentation/overview`) |
| `componentsUrl`   | Katalog komponen terpublikasi (`/components`)        |

**Preview template live:** [https://template.teristimewa.com/vue-dashboard-template-01](https://template.teristimewa.com/vue-dashboard-template-01)

### Menu sidebar (navigasi end user)

Saat menjalankan `make dev`, area terproteksi menampilkan item menu utama berikut:

| Key menu              | Route            | Fitur                                                     |
| --------------------- | ---------------- | --------------------------------------------------------- |
| Dashboard             | `/dashboard`     | Kartu statistik, chart                                    |
| Users                 | `/users`         | Tabel dengan paginasi, drawer CRUD                        |
| Settings              | `/settings`      | Preferensi aplikasi, tema                                 |
| Documentation _(DEV)_ | `/documentation` | Landing → `tutorialUrl` (dokumentasi terpublikasi)        |
| Components _(DEV)_    | `/components`    | Landing → `componentsUrl` (katalog komponen terpublikasi) |

Saat development, **Documentation** dan **Components** menampilkan badge DEV. Build produksi (`make build`) tidak menyertakan landing tersebut. Sembunyikan saat dev dengan `VITE_SHOW_DEV_FEATURES=false` di `.env` atau `.env.development`.

Panduan interaktif langkah demi langkah (Overview, Tutorial, Preview) ada di [live preview](https://template.teristimewa.com/vue-dashboard-template-01/documentation/overview).

---

<a id="id-3-tech-stack--dependensi"></a>

## 3. Tech Stack & Dependensi

Dipin via [Volta](https://volta.sh) di `package.json`. Juga diset via `packageManager` untuk Corepack:

| Tool    | Versi                  |
| ------- | ---------------------- |
| Node.js | `22.23.1` (disarankan) |
| pnpm    | `11.17.0` (disarankan) |

Pin yang disarankan dijaga selaras di `package.json` (`volta`, `packageManager`, `engines`). Setelah `cd` ke repo, Volta mengganti kedua tool secara otomatis.

**Aktifkan dukungan pnpm Volta** (sekali per mesin jika pakai Volta):

- **Panduan OS lengkap:** [VOLTA.id.md](./VOLTA.id.md) (macOS zsh/bash, Linux/WSL bash/zsh, Windows PowerShell; troubleshooting `VOLTA_FEATURE_PNPM` kosong dan PATH tertutup nvm)
- **Tanpa Volta:** tetap install Node **22.23.1** dan pnpm **11.17.0** sendiri - lihat [VOLTA.id.md - Tanpa Volta](./VOLTA.id.md#tanpa-volta)
- Ringkas: [README.id → Aktifkan Volta](./README.id.md#aktifkan-volta-disarankan)

```bash
# 1. Install Volta (jika belum)
curl https://get.volta.sh | bash
# buka ulang terminal

# 2. Tambah di AKHIR ~/.zshrc (setelah nvm/fnm/asdf); pakai ~/.bashrc di bash Linux
cat >> ~/.zshrc <<'EOF'

# Volta (taruh di akhir file agar menang dari nvm/fnm/asdf)
export VOLTA_FEATURE_PNPM=1
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
EOF
source ~/.zshrc
echo "$VOLTA_FEATURE_PNPM"   # expect: 1

# 3. Install pin (sekali per mesin; tidak perlu volta pin jika package.json sudah punya volta)
volta install node@22.23.1 pnpm@11.17.0
which node                   # expect: ~/.volta/bin/node
```

Di Windows, set user environment variable `VOLTA_FEATURE_PNPM=1` (lihat [VOLTA.id.md - Windows PowerShell](./VOLTA.id.md#5-windows--powershell)), buka terminal baru, lalu jalankan `volta install node@22.23.1 pnpm@11.17.0`.

Build script dependency yang diizinkan ada di `pnpm-workspace.yaml` (`allowBuilds.esbuild` / `allowBuilds.vue-demi` = `true`). Tanpa entri itu, `pnpm install` gagal dengan `ERR_PNPM_IGNORED_BUILDS`.

### Dependensi runtime

| Paket        | Peran                                            |
| ------------ | ------------------------------------------------ |
| `vue`        | Rendering UI (Composition API, `<script setup>`) |
| `vue-router` | Routing client-side, lazy routes                 |
| `pinia`      | State global dan fitur                           |
| `axios`      | HTTP client (via `backendService`)               |

### Dependensi dev

| Paket                 | Peran                           |
| --------------------- | ------------------------------- |
| `typescript`          | Static typing                   |
| `vite`                | Dev server & production bundler |
| `@vitejs/plugin-vue`  | Dukungan Vue SFC                |
| `tailwindcss`         | CSS utility-first               |
| `eslint` + `prettier` | Linting dan formatting          |
| `vue-tsc`             | Pengecekan TypeScript Vue       |

**Path alias:** `@/*` → `src/*` (dikonfigurasi di `tsconfig.json` dan `vite.config.ts`).

---

<a id="id-4-mulai-dari-readme"></a>

## 4. Mulai dari README

**Tidak dibahas di sini** (lihat [README.id.md](./README.id.md)):

| Topik                                     | Bagian README                                                                                                                              |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Prasyarat & instal per OS                 | [Prerequisites](./README.md#prerequisites) · [Aktifkan Volta](./README.id.md#aktifkan-volta-disarankan) · **[VOLTA.id.md](./VOLTA.id.md)** |
| Clone, install, `make dev`                | [Quick Start](./README.md#quick-start)                                                                                                     |
| Perintah `make generate` / `make feature` | [Scaffolding](./README.md#scaffolding)                                                                                                     |
| Tanpa Make (`pnpm`, `node scripts/…`)     | [Without Make](./README.md#without-make)                                                                                                   |
| Referensi Makefile                        | [Commands](./README.md#commands-makefile)                                                                                                  |
| Ringkasan variabel environment            | [Environment](./README.md#environment)                                                                                                     |

Dokumen ini mengasumsikan aplikasi berjalan secara lokal. Login demo: `admin@mail.com` / `password123`.

---

<a id="id-5-bootstrap-aplikasi"></a>

## 5. Bootstrap Aplikasi

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

Memuat style global (`index.css`), mendaftarkan Pinia dan Vue Router, menginisialisasi auth dan tema dari `localSource`.

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

**Urutan penting:** `AppErrorBoundary` menangkap error render. `ToastHost` dan `ModalHost` menyediakan UI toast dan modal global. `RouterView` merender route yang cocok setelah bootstrap auth selesai.

Berbeda dengan React context providers, **locale dan tema** adalah Pinia store yang diinisialisasi di `main.ts`. Auth juga Pinia store (`useAuthStore`), bukan komponen wrapper.

---

<a id="id-6-state-global-pinia"></a>

## 6. State Global (Pinia)

State global ada di Pinia store. State spesifik fitur ada di `src/features/<name>/stores/`.

### Referensi store

| Store            | File                                    | Composable        | Tanggung jawab                                        |
| ---------------- | --------------------------------------- | ----------------- | ----------------------------------------------------- |
| `useLocaleStore` | `locales/localeStore.ts`                | `useLocale()`     | `t(key, params?)`, `locale`, `setLocale`              |
| `useAuthStore`   | `features/auth/stores/authStore.ts`     | `useAuthStore()`  | `user`, `token`, `login`, `logout`, `isAuthenticated` |
| `useThemeStore`  | `core/stores/themeStore.ts`             | `useThemeStore()` | `mode`, `resolvedTheme`, `setMode`, `toggleTheme`     |
| `useToastStore`  | `components/Toast/stores/toastStore.ts` | `useToastStore()` | Menampilkan toast success/error/info                  |
| `useModalStore`  | `components/Modal/stores/modalStore.ts` | `useModalStore()` | Dialog konfirmasi                                     |

### Contoh `useLocale()`

```vue
<script setup lang="ts">
import { useLocale } from '@/locales/localeStore';

const { t, locale, setLocale } = useLocale();
</script>

<template>
  <p>{{ t('users.deleteMessage', { name: 'John Doe' }) }}</p>
</template>
```

### Contoh `useAuthStore()`

```ts
import { useAuthStore } from '@/features/auth/stores/authStore';

const authStore = useAuthStore();
await authStore.login({ email: 'admin@mail.com', password: 'password123' });
authStore.logout();
```

### Contoh `useThemeStore()`

```ts
import { useThemeStore } from '@/core/stores/themeStore';

const themeStore = useThemeStore();
themeStore.setMode('dark'); // 'light' | 'dark' | 'system'
themeStore.toggleTheme();
```

### Toast dan modal

```ts
import { useToastStore } from '@/components/Toast';
import { useModalStore } from '@/components/Modal';

const toastStore = useToastStore();
toastStore.showToast({ type: 'success', title: 'Berhasil disimpan' });

const modalStore = useModalStore();
const confirmed = await modalStore.confirm({
  title: 'Hapus pengguna?',
  message: 'Tindakan ini tidak dapat dibatalkan.',
  variant: 'danger',
});
```

---

<a id="id-7-arsitektur-routing"></a>

## 7. Arsitektur Routing

Route didefinisikan di `src/router/index.ts`. Route fitur ada di `src/router/featureRoutes.ts` dan di-spread ke `protectedChildren` via `...featureRoutes`.

### Struktur layout

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

`router.beforeEach` di `index.ts` memeriksa `useAuthStore().isAuthenticated` dan mengalihkan pengguna yang belum login ke `/login`. Pengguna terautentikasi di `/login` atau `/register` dialihkan ke `/dashboard`.

### Code splitting

Halaman dimuat via `lazyPage()` yang membungkus dynamic import dengan logika retry:

```ts
const UsersPage = lazyPage(() => import('@/features/users/pages/UsersPage'));
```

`lazyPage` dipakai untuk semua komponen route. `SkeletonLoader` muncul saat chunk sedang dimuat.

### Basename (deploy subpath)

`routerBasename` berasal dari `src/config/basePath.ts` (membaca `import.meta.env.BASE_URL`). Set `VITE_BASE_PATH` saat aplikasi disajikan di bawah subpath (lihat [Deployment](#id-18-deployment)).

---

<a id="id-8-struktur-proyek"></a>

## 8. Struktur Proyek

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
│       ├── tutorial/          # Landing Documentation (DEV) → tutorialUrl
│       └── storybook/         # Landing Components (DEV) → componentsUrl
│
├── DOCUMENTATION.md           # Panduan developer end-user (English)
├── DOCUMENTATION.id.md        # Versi Bahasa Indonesia
├── README.md
└── Makefile
```

### Layout folder fitur standar

```
src/features/<name>/
├── pages/<Name>Page.vue       # Route entry: title + composes table
├── components/                # Feature-specific UI (tables, forms)
├── stores/<name>Store.ts      # Pinia: fetch state, pagination, filters
└── usecase/<name>Usecase.ts   # Business logic → repository / apiSource
```

`scope=page` dari `make feature` hanya menghasilkan `pages/` plus wiring router/menu/locale.

---

<a id="id-9-pola-modul-fitur"></a>

## 9. Pola Modul Fitur

Setiap fitur mengikuti pola layered yang sama. Fitur **Users** disertakan di template ini dan menjadi referensi CRUD penuh. **Inventory** adalah contoh Tutorial (tabel + filter + mock data).

### Tanggung jawab per lapisan

| File              | Lapisan      | Fungsi                                              |
| ----------------- | ------------ | --------------------------------------------------- |
| `UsersPage.vue`   | Presentation | Shell halaman, judul, mengomposisi `<UsersTable />` |
| `UsersTable.vue`  | Presentation | Kolom, DataTable, Pagination, drawer                |
| `usersStore.ts`   | Application  | Pinia: state fetch, paginasi, seleksi               |
| `usersUsecase.ts` | Application  | Operasi async, mendelegasi ke repository            |

### Contoh: halaman tipis

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

**Aturan:** Halaman tetap tipis. Tidak ada `axios`, `localStorage`, atau panggilan API langsung di halaman atau komponen tabel.

---

<a id="id-10-pustaka-komponen-reusable"></a>

## 10. Pustaka Komponen Reusable

Semua UI bersama ada di `src/components/`. Dibangun dengan Tailwind CSS dan token dari `src/config/color.tokens.ts`.

### Katalog komponen

| Komponen           | Import                          | Penggunaan tipikal            |
| ------------------ | ------------------------------- | ----------------------------- |
| `Button`           | `@/components/Button`           | Aksi, submit form             |
| `Input`            | `@/components/Input`            | Field teks, validasi          |
| `ComboBox`         | `@/components/ComboBox`         | Select dengan pencarian       |
| `DataTable`        | `@/components/DataTable`        | Tabel sortable dengan loading |
| `Pagination`       | `@/components/Pagination`       | Navigasi halaman              |
| `Modal`            | `@/components/Modal`            | Dialog konfirmasi             |
| `Drawer`           | `@/components/Drawer`           | Panel samping                 |
| `Toast`            | `@/components/Toast`            | Notifikasi                    |
| `Badge`            | `@/components/Badge`            | Chip status                   |
| `Card`             | `@/components/Card`             | Kontainer konten              |
| `Avatar`           | `@/components/Avatar`           | Avatar pengguna               |
| `Toggle`           | `@/components/Toggle`           | Switch boolean                |
| `Typography`       | `@/components/Typography`       | Title, Text, Paragraph        |
| `Chart`            | `@/components/Chart`            | Bar, Line, Donut, MetricCard  |
| `FileManagement`   | `@/components/FileManagement`   | Upload / download             |
| `Layout`           | `@/components/Layout`           | Grid, Flex, Masonry, Splitter |
| `NavMenu`          | `@/components/NavMenu`          | Pohon navigasi sidebar        |
| `SkeletonLoader`   | `@/components/SkeletonLoader`   | Placeholder loading           |
| `ScrollToTop`      | `@/components/ScrollToTop`      | Scroll container + anchor     |
| `CodeBlock`        | `@/components/CodeBlock`        | Kode dengan syntax highlight  |
| `AppErrorBoundary` | `@/components/AppErrorBoundary` | Layar recovery error          |

### Tempat menelusuri komponen

| Kapan                    | URL                                                                                                                                    |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| **`make dev` (sidebar)** | **Components** (badge DEV) → membuka `componentsUrl`                                                                                   |
| **Katalog live**         | [template.teristimewa.com/vue-dashboard-template-01/components](https://template.teristimewa.com/vue-dashboard-template-01/components) |

Katalog live menampilkan props, state matrix, dan contoh kode copy-paste.

### Aturan locale komponen

Teks default di dalam `src/components/` memakai `t('components.common.*')` dari `src/components/locales/en.json` dan `id.json`. Copy spesifik fitur masuk ke `src/locales/`.

---

<a id="id-11-pinia-store-fitur"></a>

## 11. Pinia Store Fitur

Store fitur adalah jembatan **Application layer** antara UI dan logika bisnis.

### Pola store fitur

Store daftar tipikal memiliki **state UI** dan **data fetching**:

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

**Konvensi:**

- `ref` + `watch` untuk daftar async
- Panggil **usecase**, jangan `axios` atau `apiSource` langsung dari store
- Komponen tabel memanggil `store.init()` di `onMounted`
- Ekspor tipe item dari file store jika spesifik fitur

### Aturan store (boleh / jangan)

| Boleh                                      | Jangan                                |
| ------------------------------------------ | ------------------------------------- |
| Panggil usecase dari store                 | Panggil `axios` atau `fetch` di store |
| Halaman tipis, delegasi ke store           | Taruh aturan bisnis di komponen tabel |
| Pakai store global untuk auth/locale/theme | Duplikasi logika auth per fitur       |

---

<a id="id-12-lapisan-data--implementasi-api"></a>

## 12. Lapisan Data & Implementasi API

### Tiga lapisan jaringan

```
backendService.ts   → Axios instance, base URL, Bearer token, 401 interceptor
apiSource.ts        → One function per REST endpoint (returns raw API JSON)
apiRepository.ts    → Business logic, validation, mock data, calls mappers
```

Usecase fitur memanggil `apiRepository` (atau `apiSource` + mapper saat menghubungkan backend nyata).

### Model: anti-corruption layer

| File                | Format           | Contoh field                     |
| ------------------- | ---------------- | -------------------------------- |
| `model.response.ts` | snake_case (API) | `full_name`, `is_active`         |
| `model.type.ts`     | camelCase (UI)   | `fullName`, `isActive`           |
| `model.map.ts`      | Fungsi transform | `toUser()`, `toPaginatedUsers()` |

**Aturan:** Komponen dan store tidak pernah melihat field API `snake_case`.

### `localSource.ts`: abstraksi storage

Jangan pakai `localStorage` langsung. Pakai `localSource`:

```ts
localSource.getToken();
localSource.setUser(user);
localSource.getTheme();
localSource.setLocale('id');
localSource.clearAuth();
```

### Status saat ini: mock vs API nyata

| Fitur                          | Sumber data saat ini                      |
| ------------------------------ | ----------------------------------------- |
| Auth (login/register)          | Mock di `apiRepository.ts`                |
| Daftar users                   | Mock di `apiRepository.ts`                |
| Dashboard                      | Mock di `dashboardUsecase.ts`             |
| Fitur baru dari `make feature` | Mock di `<name>Usecase.ts` (scope `full`) |

`apiSource.ts` mendefinisikan bentuk endpoint nyata saat Anda menghubungkan backend.

### Cara menghubungkan API nyata (contoh Users)

**Langkah 1:** Set `VITE_API_BASE_URL` di `.env`.

**Langkah 2:** Ganti mock di `apiRepository.ts`:

```ts
async getUsers(page: number, pageSize: number): Promise<PaginatedResult<User>> {
  const response = await apiSource.getUsers(page, pageSize);
  return toPaginatedUsers(response);
},
```

**Langkah 3:** Tidak perlu perubahan di usecase, store, atau halaman.

Untuk **halaman baru** (mis. Inventory dari Tutorial), ikuti [Bagian 16 Langkah 11](#id-step-11--hubungkan-api-nyata-saat-backend-siap) atau langkah 5 Tutorial in-app.

---

<a id="id-13-i18n--tema"></a>

## 13. i18n & Tema

### Locale

| File                  | Bahasa           |
| --------------------- | ---------------- |
| `src/locales/en.json` | English          |
| `src/locales/id.json` | Bahasa Indonesia |

Kedua file harus punya **struktur key yang sama**. Nama parameter di `{{param}}` harus cocok di semua locale; urutan kata boleh berbeda.

Locale default: `'en'` di `src/config/app.config.ts`.

### Tema

`useThemeStore` mendukung `light`, `dark`, dan `system`. Disimpan ke localStorage via `localSource`. Toggle di header via tombol tema.

Untuk mengubah warna brand, edit `src/config/color.tokens.ts` dan jaga agar `tailwind.config.js` tetap sinkron.

### Branding aplikasi

Ganti `public/logo-light.svg` dan `public/logo-dark.svg`. Perbarui `title`, `description.en`, `description.id`, dan path logo di `src/config/app.config.ts`. Lihat langkah 6 Tutorial (branding) atau [Bagian 14](#id-14-dokumentasi-in-app-overview--tutorial).

---

<a id="id-14-dokumentasi-in-app-overview--tutorial"></a>

## 14. Dokumentasi In-app (Overview & Tutorial)

Saat `make dev`, sidebar menampilkan **Documentation** _(DEV)_ sebagai landing yang membuka `tutorialUrl` di `external-links.json` (dokumentasi terpublikasi). **File `DOCUMENTATION.id.md` ini** tetap di repo untuk referensi offline.

UI langkah demi langkah penuh ada di [live preview](https://template.teristimewa.com/vue-dashboard-template-01/documentation/overview):

### Overview

| Langkah | Topik                                                       |
| ------- | ----------------------------------------------------------- |
| 1       | Prasyarat + jalur cepat (clone → generate → dev)            |
| 2       | Clone repositori template                                   |
| 3       | Alur kerja `make generate`                                  |
| 4       | Lokalisasi (i18n)                                           |
| 5       | Variabel environment (dev vs production)                    |
| 6–8     | Tautan ke Tutorial (tambah halaman, branding, lapisan data) |

### Tutorial

| Langkah | Topik                                             |
| ------- | ------------------------------------------------- |
| 1       | Scaffold dengan `make feature` (contoh Inventory) |
| 2       | Buat kode fitur manual (opsional)                 |
| 3       | Tambah menu dan route manual (opsional)           |
| 4       | Mock data (default)                               |
| 5       | Hubungkan API nyata (opsional)                    |
| 6       | Kustomisasi logo dan judul aplikasi               |

### Preview

Halaman **Inventory** live - struktur sama dengan `make feature name=inventory scope=full`.

---

<a id="id-15-buat-halaman-baru--shortcut-make-feature"></a>

## 15. Buat Halaman Baru: Shortcut (`make feature`)

Cara tercepat menambah menu sidebar, route, key locale, dan folder fitur:

```bash
make feature name=inventory label="Inventory" label-id="Inventaris"
```

### Scope

| Scope              | Yang dihasilkan                   | Mock data         |
| ------------------ | --------------------------------- | ----------------- |
| `full` _(default)_ | page, table, Pinia store, usecase | di `usecase/*.ts` |
| `store`            | page, table, Pinia store          | inline di store   |
| `page`             | page saja                         | tidak ada         |

### Parameter

| Parameter  | Wajib      | Deskripsi                                                                |
| ---------- | ---------- | ------------------------------------------------------------------------ |
| `name`     | Ya         | Key fitur → `src/features/<name>/`, route `/<name>`, locale `nav.<name>` |
| `label`    | Disarankan | Label sidebar English → `en.json`                                        |
| `label-id` | Disarankan | Label sidebar Indonesia → `id.json`                                      |
| `scope`    | Tidak      | `full` · `store` · `page` (alias: `empty`)                               |

### Contoh

```bash
make feature name=reports scope=store label="Reports" label-id="Laporan"
make feature name=alerts scope=page label="Alerts" label-id="Peringatan"
```

### File yang diubah otomatis

1. `src/features/<name>/pages/<Name>Page.vue`
2. `src/features/<name>/components/<Name>Table.vue` _(full / store)_
3. `src/features/<name>/stores/<name>Store.ts` _(full / store)_
4. `src/features/<name>/usecase/<name>Usecase.ts` _(full only)_
5. `src/router/featureRoutes.ts`
6. `src/layouts/sidebar/featureMenuItems.ts`
7. `src/locales/en.json` + `id.json` (`nav.*`, `<name>.subtitle`)

Buka tab **Tutorial** untuk contoh kode live dan preview Inventory.

---

<a id="id-16-buat-halaman-baru--walkthrough-manual"></a>

## 16. Buat Halaman Baru: Walkthrough Manual

Pakai ini saat Anda butuh kontrol penuh atau ingin memahami apa yang dilakukan `make feature`. Kita membuat halaman **Products** dengan mock data, lalu opsional menghubungkan API nyata.

### Langkah 1: Buat struktur folder fitur

```
src/features/products/
├── pages/ProductsPage.vue
├── components/ProductsTable.vue
├── stores/productsStore.ts
└── usecase/productsUsecase.ts
```

### Langkah 2: Tambah key locale

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

### Langkah 3: Buat halaman

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

### Langkah 4: Buat usecase (mock dulu)

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

### Langkah 5: Buat Pinia store

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

### Langkah 6: Buat komponen tabel

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

Lihat `src/features/inventory/components/InventoryTable.vue` untuk filter dan pola kolom lanjutan.

### Langkah 7: Daftarkan route

Tambahkan ke `src/router/featureRoutes.ts`:

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

Pastikan `...featureRoutes` di-spread di `protectedChildren` di dalam `src/router/index.ts` (sudah disetup di template ini).

### Langkah 8: Tambah item menu sidebar

Tambahkan di dalam `buildFeatureMenuItems()` di `src/layouts/sidebar/featureMenuItems.ts`:

```ts
{
  key: 'products',
  label: t('nav.products'),
  path: '/products',
  icon: h(FeatureMenuIcon),
},
```

### Langkah 9: Verifikasi di browser

```bash
make dev
```

Navigasi ke `/products`. Anda harus melihat tabel dengan mock data dan paginasi yang berfungsi.

### Langkah 11: Hubungkan API nyata (saat backend siap)

<a id="id-step-11--hubungkan-api-nyata-saat-backend-siap"></a>

**Langkah 1:** Set `VITE_API_BASE_URL` di `.env`.

**Langkah 2:** Tambah tipe response API di `model.response.ts` (snake_case):

```ts
export interface ApiInventoryItemResponse {
  id: string;
  name: string;
  is_active: boolean;
}
```

**Langkah 3:** Tambah tipe domain di `model.type.ts` (camelCase):

```ts
export interface InventoryItem {
  id: string;
  name: string;
  isActive: boolean;
}
```

**Langkah 4:** Tambah mapper di `model.map.ts`:

```ts
export function toInventoryItem(api: ApiInventoryItemResponse): InventoryItem {
  return { id: api.id, name: api.name, isActive: api.is_active };
}
```

**Langkah 5:** Tambah endpoint di `apiSource.ts`:

```ts
async getInventory(page: number, pageSize: number): Promise<ApiInventoryListResponse> {
  const response = await backendService.get('/inventory', {
    params: { page, page_size: pageSize },
  });
  return response.data;
},
```

**Langkah 6:** Ganti mock di `inventoryUsecase.ts`:

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

Pinia store (`inventoryStore`) dan halaman (`InventoryPage`) **tidak perlu perubahan**.

---

<a id="id-17-setelah-make-generate"></a>

## 17. Setelah `make generate`

Sintaks perintah dan langkah first-run ada di [README.md - Scaffolding](./README.md#scaffolding). Perubahan **arsitektural** di aplikasi output:

| Setting / file                             | Efek                                                                    |
| ------------------------------------------ | ----------------------------------------------------------------------- |
| `app.config.ts` → `isBoilerplate: false`   | Sidebar menampilkan Documentation **landing** (tautan ke `tutorialUrl`) |
| `enableDevFeaturesInProduction: false`     | Build produksi tidak menyertakan landing Documentation & Components     |
| `DOCUMENTATION.md` / `DOCUMENTATION.id.md` | Panduan mendalam ini ikut ke aplikasi hasil generate                    |
| Scaffolding                                | `make generate` / `make feature` tetap tersedia                         |
| `git init`                                 | Repositori baru di folder output                                        |

Kustomisasi `title`, logo, dan `external-links.json` di aplikasi hasil generate sebelum deploy pertama.

---

<a id="id-18-deployment"></a>

## 18. Deployment

| Variabel                    | Default      | Fungsi                                             |
| --------------------------- | ------------ | -------------------------------------------------- |
| `VITE_API_BASE_URL`         | `/api`       | Base URL API backend                               |
| `VITE_BASE_PATH`            | `/`          | Base path saat disajikan di bawah subpath          |
| `VITE_SHOW_DEV_FEATURES`    | `true` (dev) | Tampilkan route landing Documentation & Components |
| `VITE_ENABLE_SCROLL_TO_TOP` | `true`       | Tombol scroll-to-top di semua halaman              |

`.env` menyimpan default. `.env.development` (`make dev`) dan `.env.production` (`make build`) menimpa per mode saat nilainya berbeda.

**Hosting subpath:** Set `VITE_BASE_PATH` sebelum `make build`. Konfigurasi SPA fallback di web server agar deep link mengarah ke `index.html`.

**Build produksi:**

```bash
make build    # or: pnpm format && pnpm build
make preview  # optional local check of dist/
```

---

## Bacaan Lanjutan

- [README.md](./README.md): quick start, prasyarat, Makefile, perintah scaffolding
- [DOCUMENTATION.md](./DOCUMENTATION.md): panduan ini dalam English
- [README.id.md](./README.id.md): ringkasan singkat (Bahasa Indonesia)
- [Katalog komponen (live)](https://template.teristimewa.com/vue-dashboard-template-01/components)
- [Dokumentasi (live)](https://template.teristimewa.com/vue-dashboard-template-01/documentation/overview)
