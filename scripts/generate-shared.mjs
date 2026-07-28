import fs from 'fs';
import path from 'path';

export function rmIfExists(target) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

const STALE_PATHS = [
  '.creator',
  'Makefile.creator',
  '.env.production.copy',
  '.env.production.creator',
  'src/config/creatorDeploy.ts',
  'src/components/CreatorDeployWelcomeModal.vue',
  'src/layouts/sidebar/stores/sidebarMenuItems.ts',
  'scripts/generate-template.mjs',
  'scripts/format-template.mjs',
  'scripts/clone-private.mjs',
  'scripts/deploy-prod.mjs',
  'scripts/deploy-prod-and-push.mjs',
  'scripts/deploy-prod-lib.mjs',
  'scripts/debug-sidebar.mjs',
  'scripts/menu-navigation-smoke.mjs',
  'scripts/nginx',
  'scripts/template',
  'src/context',
];

export function removeStalePaths(outputDir) {
  for (const rel of STALE_PATHS) {
    rmIfExists(path.join(outputDir, rel));
  }
}

export function patchMakefile(outputDir) {
  const makefilePath = path.join(outputDir, 'Makefile');
  if (!fs.existsSync(makefilePath)) return;

  let content = fs.readFileSync(makefilePath, 'utf8');
  content = content.replace(/^-include Makefile\.creator\n\n?/m, '');
  content = content.replace(/\t@\[ -f Makefile\.creator \].*\n/m, '');
  fs.writeFileSync(makefilePath, content);
}

const FORBIDDEN_BASE_PATH = 'vue-dashboard-template-01';

export function assertEndUserBasePath(outputDir) {
  if (fs.existsSync(path.join(outputDir, '.env.production.creator'))) {
    throw new Error('.env.production.creator must not ship in generated apps.');
  }

  const viteConfigPath = path.join(outputDir, 'vite.config.ts');
  if (fs.existsSync(viteConfigPath)) {
    const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
    if (
      viteConfig.includes('.env.production.creator') ||
      viteConfig.includes("path.join(root, '.creator')")
    ) {
      throw new Error('vite.config.ts still contains creator-only base path logic.');
    }
  }

  for (const file of ['.env', '.env.development', '.env.production', '.env.local']) {
    const full = path.join(outputDir, file);
    if (!fs.existsSync(full)) continue;

    for (const line of fs.readFileSync(full, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.startsWith('VITE_BASE_PATH=')) continue;
      if (trimmed.includes(FORBIDDEN_BASE_PATH)) {
        throw new Error(
          `${file} sets VITE_BASE_PATH to /${FORBIDDEN_BASE_PATH}/ — apps must use / (root).`,
        );
      }
    }
  }
}

export function prepareGeneratedApp(outputDir) {
  removeStalePaths(outputDir);
  patchMakefile(outputDir);
  assertEndUserBasePath(outputDir);
}
