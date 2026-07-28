import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { appendArrayEntry, parseName } from './generate-feature.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const GENERATE_FEATURE = path.join(SCRIPT_DIR, 'generate-feature.mjs');
const TEMPLATE_DIR = path.join(SCRIPT_DIR, 'template');

function setupFixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'feature-gen-test-'));
  fs.mkdirSync(path.join(dir, 'scripts'));
  fs.mkdirSync(path.join(dir, 'src/router'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'src/layouts/sidebar'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'src/locales'), { recursive: true });

  fs.copyFileSync(GENERATE_FEATURE, path.join(dir, 'scripts/generate-feature.mjs'));
  fs.copyFileSync(
    path.join(SCRIPT_DIR, 'shell-utils.mjs'),
    path.join(dir, 'scripts/shell-utils.mjs'),
  );
  fs.copyFileSync(
    path.join(TEMPLATE_DIR, 'featureRoutes.ts'),
    path.join(dir, 'src/router/featureRoutes.ts'),
  );
  fs.copyFileSync(
    path.join(TEMPLATE_DIR, 'featureRoutesGenerate.ts'),
    path.join(dir, 'src/router/featureRoutesGenerate.ts'),
  );
  fs.copyFileSync(
    path.join(TEMPLATE_DIR, 'featureMenuItems.ts'),
    path.join(dir, 'src/layouts/sidebar/featureMenuItems.ts'),
  );
  fs.copyFileSync(
    path.join(TEMPLATE_DIR, 'featureMenuItemsGenerate.ts'),
    path.join(dir, 'src/layouts/sidebar/featureMenuItemsGenerate.ts'),
  );
  fs.writeFileSync(path.join(dir, 'src/locales/en.json'), '{"nav":{}}\n');
  fs.writeFileSync(path.join(dir, 'src/locales/id.json'), '{"nav":{}}\n');

  return dir;
}

function runFeature(dir, args) {
  execSync(`node scripts/generate-feature.mjs ${args}`, { cwd: dir, stdio: 'pipe' });
}

test('appendArrayEntry keeps a single opening brace when inner has trailing whitespace', () => {
  const inner = "\n  {\n    path: 'inventory',\n  },\n";
  const entry = "  {\n    path: 'reports',\n  }";
  const result = appendArrayEntry(inner, entry);

  assert.equal(result.startsWith('\n  {'), true);
  assert.equal(result.includes('{{'), false);
});

test('sequential generation: full → store → page scopes produce valid routes', () => {
  const dir = setupFixture();

  runFeature(dir, '--name=inventory --label="Inventory" --label-id="Inventaris"');
  runFeature(dir, '--name=reports --scope=store --label="Reports" --label-id="Laporan"');
  runFeature(dir, '--name=alerts --scope=page --label="Alerts" --label-id="Peringatan"');

  const routesGeneratePath = path.join(dir, 'src/router/featureRoutesGenerate.ts');
  const routesRegistryPath = path.join(dir, 'src/router/featureRoutes.ts');
  const menuGeneratePath = path.join(dir, 'src/layouts/sidebar/featureMenuItemsGenerate.ts');
  const menuRegistryPath = path.join(dir, 'src/layouts/sidebar/featureMenuItems.ts');
  const routes = fs.readFileSync(routesGeneratePath, 'utf8');
  const routesRegistry = fs.readFileSync(routesRegistryPath, 'utf8');
  const menu = fs.readFileSync(menuGeneratePath, 'utf8');
  const menuRegistry = fs.readFileSync(menuRegistryPath, 'utf8');

  assert.equal(routes.includes('{{'), false, 'routes must not contain doubled braces');
  assert.equal(menu.includes('{{'), false, 'menu must not contain doubled braces');
  assert.match(routes, /path: 'inventory'/);
  assert.match(routes, /path: 'reports'/);
  assert.match(routes, /path: 'alerts'/);
  assert.match(menu, /key: 'inventory'/);
  assert.match(menu, /key: 'reports'/);
  assert.match(menu, /key: 'alerts'/);
  assert.match(routes, /const InventoryPage = lazyPage/);
  assert.match(routes, /const ReportsPage = lazyPage/);
  assert.match(routes, /const AlertsPage = lazyPage/);
  assert.match(routes, /import \{ lazyPage \} from '@\/router\/lazyPage'/);
  assert.match(routesRegistry, /generatedFeatureRoutes/);
  assert.doesNotMatch(routesRegistry, /const InventoryPage = lazyPage/);
  assert.match(menuRegistry, /buildGeneratedFeatureMenuItems/);
  assert.doesNotMatch(menuRegistry, /key: 'inventory'/);
});

test('manual tutorial flow: feature files then locale, menu, and route wiring', () => {
  const dir = setupFixture();

  execSync(
    `node --input-type=module -e "
import { parseName, buildTemplates, writeManualFeatureFiles, wireManualFeatureNavigation } from './scripts/generate-feature.mjs';
const meta = parseName('inventory');
const labels = { labelEn: 'Inventory', labelId: 'Inventaris' };
const templates = buildTemplates(meta, labels, 'full');
writeManualFeatureFiles(meta, templates);
wireManualFeatureNavigation(meta, templates);
"`,
    { cwd: dir, stdio: 'pipe' },
  );

  const pagePath = path.join(dir, 'src/features/inventory/pages/InventoryPage.vue');
  const storePath = path.join(dir, 'src/features/inventory/stores/inventoryStore.ts');
  const usecasePath = path.join(dir, 'src/features/inventory/usecase/inventoryUsecase.ts');
  const routesGeneratePath = path.join(dir, 'src/router/featureRoutesGenerate.ts');
  const menuGeneratePath = path.join(dir, 'src/layouts/sidebar/featureMenuItemsGenerate.ts');
  const enLocalePath = path.join(dir, 'src/locales/en.json');
  const idLocalePath = path.join(dir, 'src/locales/id.json');

  assert.equal(fs.existsSync(pagePath), true);
  assert.equal(fs.existsSync(storePath), true);
  assert.equal(fs.existsSync(usecasePath), true);

  const routes = fs.readFileSync(routesGeneratePath, 'utf8');
  const menu = fs.readFileSync(menuGeneratePath, 'utf8');
  const enLocale = JSON.parse(fs.readFileSync(enLocalePath, 'utf8'));
  const idLocale = JSON.parse(fs.readFileSync(idLocalePath, 'utf8'));

  assert.equal(routes.includes('{{'), false);
  assert.equal(menu.includes('{{'), false);
  assert.match(routes, /path: 'inventory'/);
  assert.match(routes, /features\/inventory\/pages\/InventoryPage/);
  assert.match(menu, /key: 'inventory'/);
  assert.match(menu, /path: '\/inventory'/);
  assert.equal(enLocale.nav.inventory, 'Inventory');
  assert.equal(idLocale.nav.inventory, 'Inventaris');
  assert.match(enLocale.inventory.subtitle, /Manage inventory/i);
  assert.match(idLocale.inventory.subtitle, /Kelola inventaris/i);
});

test('multi-word label and label-id are written to locale files', () => {
  const dir = setupFixture();

  runFeature(dir, '--name=multi-word --label="Test by system" --label-id="Di test oleh sistim"');

  const enLocale = JSON.parse(fs.readFileSync(path.join(dir, 'src/locales/en.json'), 'utf8'));
  const idLocale = JSON.parse(fs.readFileSync(path.join(dir, 'src/locales/id.json'), 'utf8'));

  assert.equal(enLocale.nav.multiWord, 'Test by system');
  assert.equal(idLocale.nav.multiWord, 'Di test oleh sistim');
});

test('make feature passes quoted multi-word labels to the generator', () => {
  const dir = setupFixture();

  fs.writeFileSync(
    path.join(dir, 'Makefile'),
    [
      'NODE := node',
      'feature:',
      '\t@$(NODE) scripts/generate-feature.mjs --name="$(name)" $(if $(label),--label="$(label)",) $(if $(label-id),--label-id="$(label-id)",)',
      '',
    ].join('\n'),
  );

  execSync('make feature name=make-label label="Test by system" label-id="Di test oleh sistim"', {
    cwd: dir,
    stdio: 'pipe',
  });

  const enLocale = JSON.parse(fs.readFileSync(path.join(dir, 'src/locales/en.json'), 'utf8'));
  const idLocale = JSON.parse(fs.readFileSync(path.join(dir, 'src/locales/id.json'), 'utf8'));

  assert.equal(enLocale.nav.makeLabel, 'Test by system');
  assert.equal(idLocale.nav.makeLabel, 'Di test oleh sistim');
});

test('parseName uses camelCase key for multi-word names', () => {
  assert.deepEqual(parseName('Multi Word'), {
    kebab: 'multi-word',
    pascal: 'MultiWord',
    camel: 'multiWord',
    localeKey: 'multiWord',
    parts: ['multi', 'word'],
  });
  assert.deepEqual(parseName('multi-word'), {
    kebab: 'multi-word',
    pascal: 'MultiWord',
    camel: 'multiWord',
    localeKey: 'multiWord',
    parts: ['multi', 'word'],
  });
  assert.deepEqual(parseName('multiWord'), {
    kebab: 'multi-word',
    pascal: 'MultiWord',
    camel: 'multiWord',
    localeKey: 'multiWord',
    parts: ['multi', 'word'],
  });
  assert.deepEqual(parseName('inventory'), {
    kebab: 'inventory',
    pascal: 'Inventory',
    camel: 'inventory',
    localeKey: 'inventory',
    parts: ['inventory'],
  });
});

test('legacy re-export of lazyPage is upgraded to a local import when wiring routes', () => {
  const dir = setupFixture();

  const routesGeneratePath = path.join(dir, 'src/router/featureRoutesGenerate.ts');
  fs.writeFileSync(
    routesGeneratePath,
    [
      "import type { RouteRecordRaw } from 'vue-router';",
      '',
      "export { lazyPage } from '@/router/lazyPage';",
      '',
      'export const generatedFeatureRoutes: RouteRecordRaw[] = [];',
      '',
    ].join('\n'),
  );

  runFeature(dir, '--name=products --label="Products" --label-id="Produk"');

  const routes = fs.readFileSync(routesGeneratePath, 'utf8');
  assert.match(routes, /import \{ lazyPage \} from '@\/router\/lazyPage'/);
  assert.match(routes, /const ProductsPage = lazyPage/);
  assert.doesNotMatch(routes, /export \{ lazyPage \} from '@\/router\/lazyPage'/);
});

test('multi-word name generates camelCase route, menu, and folder keys', () => {
  const dir = setupFixture();

  runFeature(dir, '--name="Multi Word" --label="Multi Word" --label-id="Multi Kata"');

  const routes = fs.readFileSync(path.join(dir, 'src/router/featureRoutesGenerate.ts'), 'utf8');
  const menu = fs.readFileSync(
    path.join(dir, 'src/layouts/sidebar/featureMenuItemsGenerate.ts'),
    'utf8',
  );
  const enLocale = JSON.parse(fs.readFileSync(path.join(dir, 'src/locales/en.json'), 'utf8'));

  assert.equal(
    fs.existsSync(path.join(dir, 'src/features/multiWord/pages/MultiWordPage.vue')),
    true,
  );
  assert.match(routes, /path: 'multiWord'/);
  assert.match(routes, /features\/multiWord\//);
  assert.match(menu, /key: 'multiWord'/);
  assert.match(menu, /path: '\/multiWord'/);
  assert.equal(enLocale.nav.multiWord, 'Multi Word');
  assert.equal(enLocale.multiWord.subtitle.length > 0, true);
});

test('make feature rejects reserved nav/route names', () => {
  const dir = setupFixture();
  fs.mkdirSync(path.join(dir, 'src/layouts/sidebar/stores'), { recursive: true });
  fs.copyFileSync(
    path.join(TEMPLATE_DIR, 'sidebarStore.ts'),
    path.join(dir, 'src/layouts/sidebar/stores/sidebarStore.ts'),
  );

  for (const name of ['components', 'dashboard']) {
    try {
      runFeature(dir, `--name=${name} --label="X" --label-id="X"`);
      assert.fail(`expected ${name} to be rejected`);
    } catch (error) {
      const detail = `${error.stderr?.toString?.() ?? ''}\n${error.message ?? ''}`;
      assert.match(detail, /already in use|Reserved/);
    }
  }
});

test('generated menu items stay NavMenu leaf-compatible', () => {
  const dir = setupFixture();
  runFeature(dir, '--name=widgets --label="Widgets" --label-id="Widget"');

  const menu = fs.readFileSync(
    path.join(dir, 'src/layouts/sidebar/featureMenuItemsGenerate.ts'),
    'utf8',
  );
  assert.match(menu, /key: 'widgets'/);
  assert.match(menu, /label: t\('nav\.widgets'\)/);
  assert.match(menu, /path: '\/widgets'/);
  assert.match(menu, /icon: FeatureMenuIcon/);
  assert.doesNotMatch(menu, /parentClick/);
  assert.doesNotMatch(menu, /children:/);
});
