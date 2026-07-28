import { defineConfig, loadEnv, type Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import fs from 'fs';
import path from 'path';

const OG_TITLE = 'Teristimewa Dashboard';
const OG_DESCRIPTION = 'Admin dashboard for daily operations';

function readExternalLinks(root: string): { previewUrl?: string } {
  const filePath = path.join(root, 'src/config/external-links.json');
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as { previewUrl?: string };
  } catch {
    return {};
  }
}

function buildOgMetaTags(options: {
  siteUrl: string;
  basePath: string;
  title: string;
  description: string;
}): string {
  const appRoot = options.siteUrl.replace(/\/$/, '');
  const base = options.basePath === '/' ? '' : options.basePath.replace(/\/$/, '');

  const asset = (file: string) =>
    appRoot ? `${appRoot}/${file}` : base ? `${base}/${file}` : `/${file}`;

  const imageUrl = asset('og-image.jpg');
  const pageUrl = appRoot ? `${appRoot}/` : undefined;
  const faviconUrl = asset('favicon.ico');
  const appleTouchUrl = asset('apple-touch-icon.png');

  return [
    `<meta name="description" content="${options.description}" />`,
    // Absolute icons so WhatsApp / scrapers don't fall back to the parent domain favicon.
    `<link rel="icon" href="${faviconUrl}" sizes="any" />`,
    `<link rel="icon" type="image/png" href="${asset('favicon-32x32.png')}" sizes="32x32" />`,
    `<link rel="apple-touch-icon" href="${appleTouchUrl}" />`,
    '<meta property="og:type" content="website" />',
    `<meta property="og:title" content="${options.title}" />`,
    `<meta property="og:description" content="${options.description}" />`,
    ...(pageUrl ? [`<meta property="og:url" content="${pageUrl}" />`] : []),
    `<meta property="og:image" content="${imageUrl}" />`,
    `<meta property="og:image:secure_url" content="${imageUrl}" />`,
    '<meta property="og:image:type" content="image/jpeg" />',
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    '<meta property="og:image:alt" content="Teristimewa Dashboard preview" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${options.title}" />`,
    `<meta name="twitter:description" content="${options.description}" />`,
    `<meta name="twitter:image" content="${imageUrl}" />`,
  ].join('\n    ');
}

function ogMetaPlugin(options: {
  siteUrl: string;
  basePath: string;
  title: string;
  description: string;
}): Plugin {
  const tags = buildOgMetaTags(options);
  return {
    name: 'og-meta',
    transformIndexHtml(html) {
      if (html.includes('<!-- og-meta -->')) {
        return html.replace('<!-- og-meta -->', tags);
      }
      return html.replace('</head>', `    ${tags}\n  </head>`);
    },
  };
}

/** Redirect `/base-path` → `/base-path/` so Vite serves the SPA under a subpath base. */
function basePathRedirectPlugin(base: string): Plugin {
  return {
    name: 'base-path-redirect',
    configureServer(server) {
      if (base === '/') return;

      const baseNoSlash = base.replace(/\/$/, '');
      server.middlewares.use((req, res, next) => {
        const rawUrl = req.url ?? '/';
        const pathname = rawUrl.split('?')[0] ?? '/';
        const query = rawUrl.includes('?') ? rawUrl.slice(rawUrl.indexOf('?')) : '';

        if (pathname === baseNoSlash) {
          res.writeHead(301, { Location: `${base}${query}` });
          res.end();
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const root = process.cwd();
  const env = loadEnv(mode, root, '');
  const rawBase = env.VITE_BASE_PATH || '/';
  const base = rawBase === '/' ? '/' : rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  const hmrPath = base === '/' ? undefined : `${base.replace(/\/$/, '')}/__vite_hmr`;
  const externalLinks = readExternalLinks(root);
  const siteUrl = (env.VITE_OG_SITE_URL || externalLinks.previewUrl || '').replace(/\/$/, '');

  return {
    plugins: [
      vue(),
      basePathRedirectPlugin(base),
      ogMetaPlugin({
        siteUrl,
        basePath: base,
        title: OG_TITLE,
        description: OG_DESCRIPTION,
      }),
    ],
    base,
    resolve: {
      extensions: ['.vue', '.mjs', '.js', '.mts', '.ts', '.json'],
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      open: base === '/' ? true : base.replace(/\/$/, ''),
      hmr: hmrPath ? { path: hmrPath } : true,
    },
    preview: {
      open: base === '/' ? true : base.replace(/\/$/, ''),
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router', 'pinia'],
            axios: ['axios'],
          },
        },
      },
    },
  };
});
