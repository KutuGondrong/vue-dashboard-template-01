#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { runLocalBin } from './shell-utils.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VALID_SCOPES = ['full', 'store', 'page'];
const ROUTES_GENERATE_FILE = 'src/router/featureRoutesGenerate.ts';
const ROUTES_REGISTRY_FILE = 'src/router/featureRoutes.ts';
const MENU_GENERATE_FILE = 'src/layouts/sidebar/featureMenuItemsGenerate.ts';
const MENU_REGISTRY_FILE = 'src/layouts/sidebar/featureMenuItems.ts';
const GENERATED_FEATURE_ICON_PATH =
  'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z';

const RESERVED_FEATURE_NAMES = new Set([
  'dashboard',
  'users',
  'settings',
  'components',
  'documentation',
  'login',
  'register',
  'auth',
  'storybook',
  'tutorial',
]);

const SIDEBAR_MENU_SOURCE_FILES = [
  MENU_GENERATE_FILE,
  MENU_REGISTRY_FILE,
  'src/layouts/sidebar/stores/sidebarStore.ts',
  'src/layouts/sidebar/stores/sidebarMenuItems.ts',
];

function parseArgs(argv) {
  const args = {};
  for (const arg of argv) {
    if (arg.startsWith('--name=')) args.name = arg.slice('--name='.length);
    if (arg.startsWith('--label=')) args.label = arg.slice('--label='.length);
    if (arg.startsWith('--label-id=')) args.labelId = arg.slice('--label-id='.length);
    if (arg.startsWith('--scope=')) args.scope = arg.slice('--scope='.length);
  }
  return args;
}

function parseScope(raw) {
  const scope = (raw || 'full').toLowerCase();
  if (scope === 'empty') return 'page';
  if (!VALID_SCOPES.includes(scope)) {
    throw new Error(`Invalid scope "${raw}". Use: full, store, page (alias: empty for page)`);
  }
  return scope;
}

function splitNameParts(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  const normalized = trimmed.replace(/[\s_]+/g, '-');
  if (normalized.includes('-')) {
    return normalized
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '')
      .split('-')
      .filter(Boolean);
  }

  const camelParts = trimmed.replace(/[^a-zA-Z0-9]/g, '').match(/[A-Z]?[a-z0-9]+/g);
  if (camelParts?.length) {
    return camelParts.map((part) => part.toLowerCase());
  }

  return [];
}

function parseName(raw) {
  const parts = splitNameParts(raw);

  if (parts.length === 0) {
    throw new Error('Feature name is required, e.g. products, my-feature, or multiWord');
  }

  const kebab = parts.join('-');
  const pascal = parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  const camel =
    parts[0] +
    parts
      .slice(1)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  const localeKey = camel;

  return { kebab, pascal, camel, localeKey, parts };
}

function escapeJsonString(value) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function appendNavLocaleEntry(content, key, label) {
  if (new RegExp(`"nav"[\\s\\S]*?"${key}"\\s*:`).test(content)) {
    throw new Error(`Nav key "${key}" already exists`);
  }

  return content.replace(/(  "nav": \{[\s\S]*?)(  \},)/, (_, navInner, navClose) => {
    let inner = navInner.replace(/\s+$/, '');
    inner = inner.replace(/(\n    "[^"]+": "(?:[^"\\]|\\.)*")(\s*)$/, '$1,$2');
    return `${inner}\n    "${key}": "${escapeJsonString(label)}"\n${navClose}`;
  });
}

function appendFeatureLocaleSection(content, key, subtitle) {
  if (content.includes(`"${key}": {`)) {
    throw new Error(`Locale key ${key} already exists`);
  }

  const block = `  "${key}": {\n    "subtitle": "${escapeJsonString(subtitle)}"\n  },`;

  if (content.includes('\n  "footer": {')) {
    return content.replace(/\n  "footer": \{/, `\n${block}\n  "footer": {`);
  }

  return content.replace(/(\n)\}$/, `$1${block}\n}$`);
}

function readRootFile(relativePath) {
  const absolute = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolute)) return null;
  return fs.readFileSync(absolute, 'utf8');
}

function readLocaleData(relativePath) {
  const absolute = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolute)) return null;
  return JSON.parse(fs.readFileSync(absolute, 'utf8'));
}

function detectExistingLocaleKey(key) {
  const found = [];
  for (const localeFile of ['src/locales/en.json', 'src/locales/id.json']) {
    const data = readLocaleData(localeFile);
    if (!data) continue;
    if (data.nav?.[key] !== undefined) {
      found.push(`nav.${key} in ${localeFile}`);
    }
    if (data[key] !== undefined) {
      found.push(`"${key}" section in ${localeFile}`);
    }
  }
  return found;
}

function detectExistingFeature(meta) {
  const found = [];
  const featureRoot = path.join(ROOT, 'src/features', meta.camel);

  if (RESERVED_FEATURE_NAMES.has(meta.camel)) {
    found.push(`Reserved app route/nav key "${meta.camel}"`);
  }

  if (fs.existsSync(featureRoot)) {
    found.push(`src/features/${meta.camel}/`);
  }

  const routerGenerate = readRootFile(ROUTES_GENERATE_FILE);
  const routerRegistry = readRootFile(ROUTES_REGISTRY_FILE);
  const routerIndex = readRootFile('src/router/index.ts');
  for (const router of [routerGenerate, routerRegistry, routerIndex].filter(Boolean)) {
    if (
      router.includes(`path: '${meta.camel}'`) ||
      router.includes(`path: '${meta.camel}/`) ||
      router.includes(`features/${meta.camel}/`)
    ) {
      found.push(`Route /${meta.camel} in router`);
      break;
    }
  }

  for (const menuFile of SIDEBAR_MENU_SOURCE_FILES) {
    const menu = readRootFile(menuFile);
    if (!menu) continue;
    if (
      menu.includes(`key: '${meta.camel}'`) ||
      menu.includes(`path: '/${meta.camel}'`) ||
      menu.includes(`nav.${meta.localeKey}`)
    ) {
      found.push(`Sidebar menu in ${menuFile}`);
      break;
    }
  }

  return [...new Set(found)];
}

function suggestFeatureNames(meta) {
  const suffixes = ['List', 'Manage', 'Overview', 'Admin'];
  return suffixes.map((suffix) => {
    const name = `${meta.camel}${suffix}`;
    const label = `${meta.pascal} ${suffix}`;
    return `make feature name="${name}" label="${label}"`;
  });
}

function exitFeatureAlreadyExists(meta, found) {
  console.error('');
  console.error(`✗ Feature name "${meta.camel}" is already in use — choose a different name.`);
  console.error('');
  console.error('  Found:');
  found.forEach((item) => console.error(`    - ${item}`));
  console.error('');
  console.error('  Locale keys use the feature name directly (nav.<name>, <name>.subtitle).');
  console.error('  Each name must be unique across features and locale files.');
  console.error('');
  console.error('  Examples:');
  suggestFeatureNames(meta).forEach((example) => console.error(`    ${example}`));
  console.error('');
  process.exit(1);
}

function writeFileIfMissing(filePath, content) {
  if (fs.existsSync(filePath)) {
    throw new Error(`File already exists: ${path.relative(ROOT, filePath)}`);
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  return true;
}

function formatGeneratedFiles(relativePaths) {
  const absolutePaths = [...new Set(relativePaths)]
    .map((rel) => path.join(ROOT, rel))
    .filter((abs) => fs.existsSync(abs));

  if (absolutePaths.length === 0) {
    return false;
  }

  if (!fs.existsSync(path.join(ROOT, 'node_modules', 'prettier'))) {
    return false;
  }

  // execFileSync (via runLocalBin) — paths with spaces must not go through a shell.
  runLocalBin(ROOT, 'prettier', ['--write', ...absolutePaths]);

  const lintTargets = absolutePaths.filter((filePath) => /\.(tsx?|vue)$/.test(filePath));
  if (lintTargets.length > 0) {
    runLocalBin(ROOT, 'eslint', [...lintTargets, '--fix']);
  }

  return true;
}

function patchFile(filePath, transform) {
  const absolute = path.join(ROOT, filePath);
  if (!fs.existsSync(absolute)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const original = fs.readFileSync(absolute, 'utf8');
  const updated = transform(original);
  if (updated === original) {
    throw new Error(`Could not patch ${filePath} — anchor not found or already patched`);
  }
  fs.writeFileSync(absolute, updated);
}

function subtitleForScope(scope, labelEn, labelId) {
  if (scope === 'page') {
    return {
      en: `Empty page scaffold for ${labelEn.toLowerCase()}: add your own components.`,
      id: `Halaman kosong untuk ${labelId.toLowerCase()}: tambahkan komponen sendiri.`,
    };
  }
  if (scope === 'store') {
    return {
      en: `Manage ${labelEn.toLowerCase()} with table, Pinia store, and inline mock data.`,
      id: `Kelola ${labelId.toLowerCase()} dengan table, Pinia store, dan mock data inline.`,
    };
  }
  return {
    en: `Manage ${labelEn.toLowerCase()} with mock data, pagination, and standard page layout.`,
    id: `Kelola ${labelId.toLowerCase()} dengan mock data, pagination, dan layout halaman standar.`,
  };
}

function buildTemplates(meta, labels, scope) {
  const { pascal, camel, localeKey } = meta;
  const { labelEn, labelId } = labels;
  const subtitles = subtitleForScope(scope, labelEn, labelId);

  const pageEmpty = `<script setup lang="ts">
import { useLocale } from '@/locales/localeStore';
import { Typography } from '@/components/Typography';

const { t } = useLocale();
</script>

<template>
  <div class="space-y-6">
    <div>
      <Typography.Title :level="2">{{ t('nav.${localeKey}') }}</Typography.Title>
      <Typography.Text color="muted" class="mt-1 block">
        {{ t('${localeKey}.subtitle') }}
      </Typography.Text>
    </div>
  </div>
</template>
`;

  const pageWithTable = `<script setup lang="ts">
import { useLocale } from '@/locales/localeStore';
import { Typography } from '@/components/Typography';
import ${pascal}Table from '@/features/${camel}/components/${pascal}Table.vue';

const { t } = useLocale();
</script>

<template>
  <div class="space-y-6">
    <div>
      <Typography.Title :level="2">{{ t('nav.${localeKey}') }}</Typography.Title>
      <Typography.Text color="muted" class="mt-1 block">
        {{ t('${localeKey}.subtitle') }}
      </Typography.Text>
    </div>

    <${pascal}Table />
  </div>
</template>
`;

  const table = `<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useLocale } from '@/locales/localeStore';
import { use${pascal}Store, type ${pascal}Item } from '@/features/${camel}/stores/${camel}Store';
import type { TableColumn } from '@/models/model.type';
import { DataTable } from '@/components/DataTable';
import Badge from '@/components/Badge/Badge.vue';

const { t } = useLocale();
const ${camel}Store = use${pascal}Store();
const { items, isLoading, page, pageSize, totalPages, totalItems } = storeToRefs(${camel}Store);

const columns = computed<TableColumn<${pascal}Item>[]>(() => [
  {
    key: 'name',
    header: t('components.common.name'),
  },
  {
    key: 'isActive',
    header: t('components.common.status'),
  },
]);

onMounted(() => {
  ${camel}Store.init();
});
</script>

<template>
  <DataTable
    :data="items"
    :columns="columns"
    :is-loading="isLoading"
    :current-page="page"
    :total-pages="totalPages"
    :page-size="pageSize"
    :total-items="totalItems"
    @page-change="${camel}Store.setPage"
    @page-size-change="${camel}Store.setPageSize"
  >
    <template #isActive="{ item }">
      <Badge
        :variant="item.isActive ? 'success' : 'danger'"
        :dot="true"
      >
        {{ item.isActive ? t('components.common.active') : t('components.common.inactive') }}
      </Badge>
    </template>
  </DataTable>
</template>
`;

  const storeWithUsecase = `import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { appConfig } from '@/config/app.config';
import { ${camel}Usecase } from '@/features/${camel}/usecase/${camel}Usecase';

export interface ${pascal}Item {
  id: string;
  name: string;
  isActive: boolean;
}

export const use${pascal}Store = defineStore('${camel}', () => {
  const items = ref<${pascal}Item[]>([]);
  const isLoading = ref(true);
  const page = ref(1);
  const pageSize = ref<number>(appConfig.paginationDefaultPageSize);
  const totalPages = ref(1);
  const totalItems = ref(0);

  async function fetchItems(): Promise<void> {
    isLoading.value = true;
    try {
      const result = await ${camel}Usecase.getItems(page.value, pageSize.value);
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

  function setPage(nextPage: number): void {
    page.value = nextPage;
  }

  function setPageSize(size: number): void {
    pageSize.value = size;
    page.value = 1;
  }

  function init(): void {
    void fetchItems();
  }

  return {
    items,
    isLoading,
    page,
    pageSize,
    totalPages,
    totalItems,
    fetchItems,
    setPage,
    setPageSize,
    init,
  };
});
`;

  const storeWithInlineMock = `import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { appConfig } from '@/config/app.config';
import type { PaginatedResult } from '@/models/model.type';

export interface ${pascal}Item {
  id: string;
  name: string;
  isActive: boolean;
}

const MOCK_${pascal.toUpperCase()}_ITEMS: ${pascal}Item[] = [
  { id: '${camel}_001', name: '${labelEn} A', isActive: true },
  { id: '${camel}_002', name: '${labelEn} B', isActive: true },
  { id: '${camel}_003', name: '${labelEn} C', isActive: false },
  { id: '${camel}_004', name: '${labelEn} D', isActive: true },
  { id: '${camel}_005', name: '${labelEn} E', isActive: true },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchMockItems(page: number, pageSize: number): Promise<PaginatedResult<${pascal}Item>> {
  await delay(500);
  const start = (page - 1) * pageSize;
  const data = MOCK_${pascal.toUpperCase()}_ITEMS.slice(start, start + pageSize);
  return {
    data,
    total: MOCK_${pascal.toUpperCase()}_ITEMS.length,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(MOCK_${pascal.toUpperCase()}_ITEMS.length / pageSize)),
  };
}

export const use${pascal}Store = defineStore('${camel}', () => {
  const items = ref<${pascal}Item[]>([]);
  const isLoading = ref(true);
  const page = ref(1);
  const pageSize = ref<number>(appConfig.paginationDefaultPageSize);
  const totalPages = ref(1);
  const totalItems = ref(0);

  async function fetchItems(): Promise<void> {
    isLoading.value = true;
    try {
      const result = await fetchMockItems(page.value, pageSize.value);
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

  function setPage(nextPage: number): void {
    page.value = nextPage;
  }

  function setPageSize(size: number): void {
    pageSize.value = size;
    page.value = 1;
  }

  function init(): void {
    void fetchItems();
  }

  return {
    items,
    isLoading,
    page,
    pageSize,
    totalPages,
    totalItems,
    fetchItems,
    setPage,
    setPageSize,
    init,
  };
});
`;

  const usecase = `import type { PaginatedResult } from '@/models/model.type';
import type { ${pascal}Item } from '@/features/${camel}/stores/${camel}Store';

const MOCK_${pascal.toUpperCase()}_ITEMS: ${pascal}Item[] = [
  { id: '${camel}_001', name: '${labelEn} A', isActive: true },
  { id: '${camel}_002', name: '${labelEn} B', isActive: true },
  { id: '${camel}_003', name: '${labelEn} C', isActive: false },
  { id: '${camel}_004', name: '${labelEn} D', isActive: true },
  { id: '${camel}_005', name: '${labelEn} E', isActive: true },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const ${camel}Usecase = {
  async getItems(page: number, pageSize: number): Promise<PaginatedResult<${pascal}Item>> {
    await delay(500);
    const start = (page - 1) * pageSize;
    const data = MOCK_${pascal.toUpperCase()}_ITEMS.slice(start, start + pageSize);
    return {
      data,
      total: MOCK_${pascal.toUpperCase()}_ITEMS.length,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(MOCK_${pascal.toUpperCase()}_ITEMS.length / pageSize)),
    };
  },
};
`;

  return {
    page: scope === 'page' ? pageEmpty : pageWithTable,
    table: scope === 'page' ? null : table,
    store: scope === 'full' ? storeWithUsecase : scope === 'store' ? storeWithInlineMock : null,
    usecase: scope === 'full' ? usecase : null,
    localeEn: { nav: labelEn, subtitle: subtitles.en },
    localeId: { nav: labelId, subtitle: subtitles.id },
  };
}

const FEATURE_MENU_ICON_BLOCK = `const FeatureMenuIcon = defineComponent({
  name: 'FeatureMenuIcon',
  render() {
    return h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': 2,
        d: '${GENERATED_FEATURE_ICON_PATH}',
      }),
    ]);
  },
});
`;

function ensureFeatureMenuIcon(content) {
  if (content.includes('const FeatureMenuIcon = defineComponent')) {
    return content;
  }

  return content.replace(
    'export function buildGeneratedFeatureMenuItems',
    `${FEATURE_MENU_ICON_BLOCK}\nexport function buildGeneratedFeatureMenuItems`,
  );
}

export function appendArrayEntry(inner, entry) {
  const trimmed = inner.trim();
  if (!trimmed) {
    return `\n${entry},\n`;
  }
  const withoutTrailingComma = trimmed.replace(/,\s*$/, '');
  const leadingWhitespace = inner.match(/^\s*/)?.[0] ?? '';
  return `${leadingWhitespace}${withoutTrailingComma},\n${entry},\n`;
}

function ensureLazyPageImport(content) {
  if (/import\s+\{\s*lazyPage\s*\}\s+from\s+['"]@\/router\/lazyPage['"]/.test(content)) {
    return content;
  }

  if (/export\s+\{\s*lazyPage\s*\}\s+from\s+['"]@\/router\/lazyPage['"]/.test(content)) {
    return content.replace(
      /export\s+\{\s*lazyPage\s*\}\s+from\s+['"]@\/router\/lazyPage['"];\s*\n/,
      "import { lazyPage } from '@/router/lazyPage';\n\nexport { lazyPage };\n",
    );
  }

  const importLine = "import { lazyPage } from '@/router/lazyPage';\n";
  const typeImportMatch = content.match(/^import type \{ RouteRecordRaw \} from 'vue-router';\n/);
  if (typeImportMatch) {
    return content.replace(typeImportMatch[0], `${typeImportMatch[0]}\n${importLine}`);
  }

  return `${importLine}\n${content}`;
}

function appendGeneratedRoute(meta) {
  patchFile(ROUTES_GENERATE_FILE, (content) => {
    if (content.includes(`features/${meta.camel}/`)) {
      return content;
    }

    let updated = ensureLazyPageImport(content);
    const lazyDecl = `const ${meta.pascal}Page = lazyPage(() => import('@/features/${meta.camel}/pages/${meta.pascal}Page'));\n\n`;
    if (!updated.includes(`const ${meta.pascal}Page = lazyPage`)) {
      updated = updated.replace(
        'export const generatedFeatureRoutes',
        `${lazyDecl}export const generatedFeatureRoutes`,
      );
    }

    const routeEntry = `  {
    path: '${meta.camel}',
    name: '${meta.camel}',
    component: ${meta.pascal}Page,
  }`;

    if (updated.includes('export const generatedFeatureRoutes: RouteRecordRaw[] = [];')) {
      return updated.replace(
        'export const generatedFeatureRoutes: RouteRecordRaw[] = [];',
        `export const generatedFeatureRoutes: RouteRecordRaw[] = [\n${routeEntry},\n];`,
      );
    }

    return updated.replace(
      /(export const generatedFeatureRoutes: RouteRecordRaw\[\] = \[)([\s\S]*?)(\n\];)/,
      (_, open, inner, close) => `${open}${appendArrayEntry(inner, routeEntry)}${close}`,
    );
  });
}

function appendGeneratedMenuItem(meta) {
  patchFile(MENU_GENERATE_FILE, (content) => {
    if (content.includes(`key: '${meta.camel}'`)) {
      return content;
    }

    let updated = ensureFeatureMenuIcon(content);
    updated = updated.replace(/\b_t\b(?=\s*:\s*\(key: string\) => string)/g, 't');

    const menuEntry = `    {
      key: '${meta.camel}',
      label: t('nav.${meta.localeKey}'),
      path: '/${meta.camel}',
      icon: FeatureMenuIcon,
    }`;

    if (updated.includes('return [];')) {
      return updated.replace('return [];', `return [\n${menuEntry},\n  ];`);
    }

    return updated.replace(
      /(export function buildGeneratedFeatureMenuItems\([\s\S]*?\): SidebarMenuItem\[\] \{\n  return \[)([\s\S]*?)(\n  \];\n\})/,
      (_, open, inner, close) => `${open}${appendArrayEntry(inner, menuEntry)}${close}`,
    );
  });
}

function patchLocales(meta, templates) {
  for (const [localeFile, labels] of [
    ['src/locales/en.json', templates.localeEn],
    ['src/locales/id.json', templates.localeId],
  ]) {
    const absolute = path.join(ROOT, localeFile);
    if (!fs.existsSync(absolute)) {
      throw new Error(`File not found: ${localeFile}`);
    }

    const data = JSON.parse(fs.readFileSync(absolute, 'utf8'));
    if (!data.nav || typeof data.nav !== 'object') {
      data.nav = {};
    }

    data.nav[meta.camel] = labels.nav;

    const existingSection =
      typeof data[meta.camel] === 'object' && data[meta.camel] !== null ? data[meta.camel] : {};
    data[meta.camel] = { ...existingSection, subtitle: labels.subtitle };

    fs.writeFileSync(absolute, `${JSON.stringify(data, null, 2)}\n`);
  }
}

/** Step 2 in the tutorial guide — create feature files without menu/route wiring. */
export function writeManualFeatureFiles(meta, templates) {
  const featureRoot = path.join(ROOT, 'src/features', meta.camel);

  fs.mkdirSync(path.join(featureRoot, 'pages'), { recursive: true });
  fs.writeFileSync(path.join(featureRoot, 'pages', `${meta.pascal}Page.vue`), templates.page);

  if (templates.table) {
    fs.mkdirSync(path.join(featureRoot, 'components'), { recursive: true });
    fs.writeFileSync(
      path.join(featureRoot, 'components', `${meta.pascal}Table.vue`),
      templates.table,
    );
  }

  if (templates.store) {
    fs.mkdirSync(path.join(featureRoot, 'stores'), { recursive: true });
    fs.writeFileSync(path.join(featureRoot, 'stores', `${meta.camel}Store.ts`), templates.store);
  }

  if (templates.usecase) {
    fs.mkdirSync(path.join(featureRoot, 'usecase'), { recursive: true });
    fs.writeFileSync(
      path.join(featureRoot, 'usecase', `${meta.camel}Usecase.ts`),
      templates.usecase,
    );
  }
}

/** Step 3 in the tutorial guide — locale, sidebar menu, and route wiring. */
export function wireManualFeatureNavigation(meta, templates) {
  patchLocales(meta, templates);
  appendGeneratedRoute(meta);
  appendGeneratedMenuItem(meta);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.name) {
    console.error(
      'Usage: node scripts/generate-feature.mjs --name=<feature> [--scope=full|store|page] [--label="Display Name"] [--label-id="Nama"]',
    );
    console.error('');
    console.error('Scopes:');
    console.error('  full  — page + table + Pinia store + usecase (default)');
    console.error('  store — page + table + Pinia store (mock data inline in store)');
    console.error('  page  — empty page + menu wiring only (alias: empty)');
    process.exit(1);
  }

  let scope;
  try {
    scope = parseScope(args.scope);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  const meta = parseName(args.name);
  const labels = {
    labelEn: args.label || meta.pascal,
    labelId: args.labelId || args.label || meta.pascal,
  };

  const existing = [
    ...new Set([...detectExistingFeature(meta), ...detectExistingLocaleKey(meta.camel)]),
  ];
  if (existing.length > 0) {
    exitFeatureAlreadyExists(meta, existing);
  }

  const featureRoot = path.join(ROOT, 'src/features', meta.camel);
  const templates = buildTemplates(meta, labels, scope);
  const created = [];

  writeFileIfMissing(path.join(featureRoot, 'pages', `${meta.pascal}Page.vue`), templates.page);
  created.push(`src/features/${meta.camel}/pages/${meta.pascal}Page.vue`);

  if (templates.table) {
    writeFileIfMissing(
      path.join(featureRoot, 'components', `${meta.pascal}Table.vue`),
      templates.table,
    );
    created.push(`src/features/${meta.camel}/components/${meta.pascal}Table.vue`);
  }

  if (templates.store) {
    writeFileIfMissing(path.join(featureRoot, 'stores', `${meta.camel}Store.ts`), templates.store);
    created.push(`src/features/${meta.camel}/stores/${meta.camel}Store.ts`);
  }

  if (templates.usecase) {
    writeFileIfMissing(
      path.join(featureRoot, 'usecase', `${meta.camel}Usecase.ts`),
      templates.usecase,
    );
    created.push(`src/features/${meta.camel}/usecase/${meta.camel}Usecase.ts`);
  }

  wireManualFeatureNavigation(meta, templates);

  const touchedFiles = [
    ...created,
    ROUTES_GENERATE_FILE,
    MENU_GENERATE_FILE,
    'src/locales/en.json',
    'src/locales/id.json',
  ];
  const formatted = formatGeneratedFiles(touchedFiles);

  const scopeLabels = {
    full: 'full (page + table + Pinia store + usecase)',
    store: 'store (page + table + Pinia store)',
    page: 'page (empty page only)',
  };

  console.log(`\n✓ Feature "${meta.camel}" generated (${scopeLabels[scope]}).\n`);
  console.log('Created:');
  created.forEach((file) => console.log(`  ${file}`));
  console.log('\nUpdated:');
  console.log(`  ${ROUTES_GENERATE_FILE}`);
  console.log(`  ${MENU_GENERATE_FILE}`);
  console.log('  src/locales/en.json');
  console.log('  src/locales/id.json');
  if (formatted) {
    console.log('\nFormatted (Prettier + ESLint --fix):');
    touchedFiles.forEach((file) => console.log(`  ${file}`));
  } else {
    console.log('\nFormat skipped (node_modules not found — run pnpm install, then make format)');
  }
  console.log('\nCustom sidebar icon (optional):');
  console.log('  1. Add your icon in src/layouts/sidebar/components/SidebarIcons.ts');
  console.log(`  2. In ${MENU_GENERATE_FILE}, replace FeatureMenuIcon for key '${meta.camel}'`);
  console.log(`\nOpen http://localhost:5173/${meta.camel} after make dev\n`);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  main();
}

export { buildTemplates, parseName };
