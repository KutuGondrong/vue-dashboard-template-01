# Vue App Boilerplate

Production-ready Vue 3 dashboard starter with Vite, TypeScript, Tailwind CSS, Pinia, and Clean Layered Architecture.

**Live template preview:** [https://template.teristimewa.com/vue-dashboard-template-01](https://template.teristimewa.com/vue-dashboard-template-01)

<a href="https://template.teristimewa.com/vue-dashboard-template-01">
  <img src="./public/og-image.jpg" alt="Teristimewa Dashboard" width="240" />
</a>

Choose Language / Pilih Bahasa:

- English (this document)
- [Bahasa Indonesia](./README.id.md)

> **Need more detail?** Volta install → [VOLTA.md](./VOLTA.md) · Architecture, Pinia, API, manual pages → [DOCUMENTATION.md](./DOCUMENTATION.md) · [DOCUMENTATION.id.md](./DOCUMENTATION.id.md)

## What you get

- **Auth** - login/register with route guards
- **Features** - Dashboard, Users (full CRUD), Settings
- **i18n** - English & Indonesian via `src/locales/` and `useLocale()`
- **Scaffolding** - `make generate` for a new app, `make feature` for menu + page
- **Docs & components** - in-app landings (development mode) that link to the published Documentation and Components sites

---

## Prerequisites

Install these **before** cloning or running the app. Versions match [package.json](./package.json) (Volta-pinned).

> **Recommended tooling:** Node **22.23.1** and pnpm **11.17.0**. Prefer [Volta](https://volta.sh) (see [VOLTA.md](./VOLTA.md)). **Without Volta**, install the same versions yourself and verify with `node --version` / `pnpm --version`.

> **Already have everything?** If `node` (≥22), `pnpm` (11.x), and `git` work in your terminal, skip to [Quick Start](#quick-start). You only need `make` (optional shortcuts) and `rsync` (only for `make generate`).

| Tool        | Version                    | Required    | Used for                                               |
| ----------- | -------------------------- | ----------- | ------------------------------------------------------ |
| **Node.js** | 22.x (22.23.1 recommended) | Yes         | Runtime & build                                        |
| **pnpm**    | 11.x (11.17.0 recommended) | Yes\*       | Install dependencies & run scripts                     |
| **Git**     | any recent                 | Recommended | Clone repo, `make generate` init                       |
| **make**    | any (GNU Make)             | Optional    | Makefile shortcuts (`make dev`, etc.)                  |
| **rsync**   | any                        | Optional    | `make generate` only (Mac/Linux usually pre-installed) |

\* npm works as a fallback (`npm install`, `npm run dev`) but this project is tested with **pnpm** (**11.17.0** via Volta; engines require ≥11).

> **pnpm install note:** Build scripts for `esbuild` and `vue-demi` are pre-approved in [`pnpm-workspace.yaml`](./pnpm-workspace.yaml) (`allowBuilds`). Do not leave placeholder values there - that causes `ERR_PNPM_IGNORED_BUILDS`.

### Enable Volta (recommended)

**Full guide (macOS zsh/bash, Linux/WSL bash/zsh, Windows PowerShell):**  
→ **[VOLTA.md](./VOLTA.md)** · [VOLTA.id.md](./VOLTA.id.md)

Volta’s pnpm support is experimental. Set `VOLTA_FEATURE_PNPM=1` so pnpm pins work. If `echo $VOLTA_FEATURE_PNPM` is empty, see [VOLTA.md - Troubleshooting](./VOLTA.md#echo-volta_feature_pnpm-is-empty).

**macOS (zsh)** (put Volta at the **end** of `~/.zshrc`, after nvm/fnm/asdf):

```bash
curl https://get.volta.sh | bash
# reopen terminal, then:
cat >> ~/.zshrc <<'EOF'

# Volta (keep at end of file so it wins over nvm/fnm/asdf)
export VOLTA_FEATURE_PNPM=1
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
EOF
source ~/.zshrc
echo "$VOLTA_FEATURE_PNPM"    # expect: 1
volta install node@22.23.1 pnpm@11.17.0
which node                    # expect: ~/.volta/bin/node
```

**Other shells / OS:** [macOS bash](./VOLTA.md#2-macos--bash) · [Linux/WSL bash](./VOLTA.md#3-linux--wsl--bash) · [Linux/WSL zsh](./VOLTA.md#4-linux--wsl--zsh) · [Windows PowerShell](./VOLTA.md#5-windows--powershell).

After that, every `cd` into this project activates the pinned Node/pnpm (no `volta pin` needed).

**Without Volta?** Still use **Node 22.23.1** and **pnpm 11.17.0**. Example: `brew install node@22` then `npm install -g pnpm@11.17.0`.

Full per-OS steps (Git, make, rsync): [Install from scratch](#install-from-scratch).

### Verify installation

```bash
node --version    # expect v22.x (e.g. v22.23.1)
pnpm --version    # expect 11.x (e.g. 11.17.0)
git --version     # any recent version
make --version    # optional - skip if you use pnpm scripts directly
rsync --version   # optional - only needed for make generate
```

---

### Install from scratch

Pick your operating system. Follow the steps **in order** if nothing is installed yet. **Volta is recommended** so Node and pnpm match the repo pins automatically after `cd`.

| OS          | Section                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------- |
| **macOS**   | [macOS](#macos)                                                                                               |
| **Linux**   | [Linux (Debian / Ubuntu)](#linux-debian--ubuntu) · [Fedora / RHEL](#linux-fedora--rhel) · [Arch](#linux-arch) |
| **Windows** | [WSL (recommended)](#windows-wsl-recommended) · [Native PowerShell](#windows-native-powershell)               |

#### macOS

```bash
# 1. Git + make (Xcode Command Line Tools - includes both)
xcode-select --install

# 2. Homebrew (skip if already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 3. Node.js 22 + pnpm 11 (pick one method)

# Option A - Volta (exact pinned versions, recommended)
# Full walkthrough: VOLTA.md (put Volta block at END of ~/.zshrc)
curl https://get.volta.sh | bash
# Restart terminal, then:
cat >> ~/.zshrc <<'EOF'

# Volta (keep at end of file so it wins over nvm/fnm/asdf)
export VOLTA_FEATURE_PNPM=1
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
EOF
source ~/.zshrc
echo "$VOLTA_FEATURE_PNPM"   # expect: 1
volta install node@22.23.1 pnpm@11.17.0
which node                   # expect: ~/.volta/bin/node

# Option B - Homebrew (simple; still install matching pnpm 11)
brew install node@22
npm install -g pnpm@11.17.0

# 4. rsync - included with macOS (no install needed)
# 5. make - included with Xcode CLT above

# Verify
node --version && pnpm --version && git --version && make --version && rsync --version
```

#### Linux (Debian / Ubuntu)

```bash
sudo apt update
sudo apt install -y git make rsync

# Recommended: Volta - see VOLTA.md (put Volta block at END of ~/.bashrc)
curl https://get.volta.sh | bash
cat >> ~/.bashrc <<'EOF'

# Volta (keep at end of file so it wins over nvm/fnm/asdf)
export VOLTA_FEATURE_PNPM=1
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
EOF
source ~/.bashrc
echo "$VOLTA_FEATURE_PNPM"   # expect: 1
volta install node@22.23.1 pnpm@11.17.0
which node                   # expect: ~/.volta/bin/node

# Alternative without Volta:
# curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
# sudo apt install -y nodejs
# npm install -g pnpm@11.17.0

# Verify
node --version && pnpm --version && git --version && make --version && rsync --version
```

#### Fedora / RHEL

```bash
sudo dnf install -y git make rsync

# Recommended: Volta - see VOLTA.md
curl https://get.volta.sh | bash
cat >> ~/.bashrc <<'EOF'

# Volta (keep at end of file so it wins over nvm/fnm/asdf)
export VOLTA_FEATURE_PNPM=1
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
EOF
source ~/.bashrc
volta install node@22.23.1 pnpm@11.17.0
which node
```

#### Arch

```bash
sudo pacman -S git make rsync nodejs npm
# Ensure Node is 22.x, then:
npm install -g pnpm@11.17.0
# Or Volta: see VOLTA.md
```

#### Windows (WSL recommended)

Use WSL2 (Ubuntu), then follow the Linux steps above (or [VOLTA.md - Linux/WSL](./VOLTA.md#3-linux--wsl--bash)).

#### Windows (Native PowerShell)

Prefer Volta ([VOLTA.md](./VOLTA.md#5-windows--powershell)) or install Node 22+ and pnpm@11.17.0, then use `pnpm` scripts instead of `make`. For `make generate`, use WSL so `rsync` is available, or run `node scripts/generate-app.mjs` from WSL.

```powershell
winget install Git.Git
winget install OpenJS.NodeJS.LTS
npm install -g pnpm@11.17.0
```

---

## Quick Start

With Volta installed and `VOLTA_FEATURE_PNPM=1` (see [Enable Volta](#enable-volta-recommended) / [VOLTA.md](./VOLTA.md)), `cd` into the repo so Node **22.23.1** and pnpm **11.17.0** activate automatically.

### 1. Clone this template

```bash
git clone https://github.com/KutuGondrong/vue-dashboard-template-01.git
cd vue-dashboard-template-01
```

Set the real clone URL in `src/config/external-links.json` → `templateRepoUrl` if you fork this repo.

### 2. Install & run

```bash
pnpm install
make dev
```

Open **http://localhost:5173**. Demo login: `admin@mail.com` / `password123`

### 3. Scaffold your own app (optional)

From inside the cloned template:

```bash
make generate name=my-new-app
cd ../my-new-app
rm -rf ../vue-dashboard-template-01
pnpm install
make dev
```

Default output is `../my-new-app` (sibling folder, outside the template). Custom path: `make generate name=my-app out=~/projects/my-app`.

---

## Documentation & Components (development mode)

When you run `make dev`, the sidebar shows **Documentation** and **Components** with a DEV badge (`VITE_SHOW_DEV_FEATURES=false` to hide). Those pages are landings that open the published interactive docs and component catalog in a new tab.

Full architecture notes live in [DOCUMENTATION.md](./DOCUMENTATION.md).

---

## Scaffolding

### `make generate` - new app from template

```bash
make generate name=my-new-app
make generate name=my-app out=~/projects/my-app
```

Creates a copy outside this repo, updates `package.json` name, and runs `git init` in the output folder.

### `make feature` - menu + page

```bash
make feature name=inventory label="Inventory" label-id="Inventaris"
make feature name=reports scope=store label="Reports" label-id="Laporan"
make feature name=alerts scope=page label="Alerts" label-id="Peringatan"
```

| Parameter  | Required    | Description                                                                                              |
| ---------- | ----------- | -------------------------------------------------------------------------------------------------------- |
| `name`     | Yes         | Feature key: `src/features/<name>/`, route `/<name>`, locale key `nav.<name>`. Use lowercase kebab-case. |
| `label`    | Recommended | English sidebar label → `src/locales/en.json` (`nav.*`)                                                  |
| `label-id` | Recommended | Indonesian sidebar label → `src/locales/id.json` (`nav.*`). Falls back to `label` if omitted.            |
| `scope`    | No          | `full` (default), `store`, or `page` (alias: `empty`)                                                    |

| Scope   | Generated                                                   |
| ------- | ----------------------------------------------------------- |
| `full`  | page + table + Pinia store + usecase (mock data in usecase) |
| `store` | page + table + Pinia store (mock inline, no usecase file)   |
| `page`  | empty page + menu/route/locale wiring only                  |

Always updated: `src/router/featureRoutes.ts`, `src/layouts/sidebar/featureMenuItems.ts`, and `nav.*` in locale files.

For manual wiring, mock vs real API, and full code samples, see [DOCUMENTATION.md](./DOCUMENTATION.md#16-create-a-new-page--manual-walkthrough).

---

## Without Make

If you **don't have `make`**, use **pnpm scripts** directly:

| Instead of                         | Run                         |
| ---------------------------------- | --------------------------- |
| `make dev`                         | `pnpm dev`                  |
| `make build`                       | `pnpm format && pnpm build` |
| `make lint`                        | `pnpm lint`                 |
| `make format`                      | `pnpm format`               |
| `make preview`                     | `pnpm preview`              |
| `make feature name=X label="Name"` | see below                   |
| `make generate name=X`             | see below                   |

**Minimal run (no make at all):**

```bash
pnpm install
pnpm dev
```

### Scaffolding without Make

```bash
# label     = English sidebar text (en.json)
# label-id  = Indonesian sidebar text (id.json)
node scripts/generate-feature.mjs --name=orders --label="Orders" --label-id="Pesanan"
node scripts/generate-feature.mjs --name=reports --scope=store --label="Reports" --label-id="Laporan"
node scripts/generate-feature.mjs --name=inventory --scope=page --label="Inventory" --label-id="Inventaris"

# Clone boilerplate outside this repo (needs rsync; use WSL on Windows)
node scripts/generate-app.mjs --name=my-app
node scripts/generate-app.mjs --name=my-app --out=~/projects/my-app
```

---

## Commands (Makefile)

| Command                                                                                | Description                                                                     |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `make dev`                                                                             | Start Vite dev server (Documentation & Components visible with DEV badge)       |
| `make build`                                                                           | Format, type-check, and production build (dev landings omitted from production) |
| `make lint`                                                                            | ESLint + TypeScript check (no file writes)                                      |
| `make format`                                                                          | Prettier + ESLint auto-fix                                                      |
| `make preview`                                                                         | Serve production build locally                                                  |
| `make clean`                                                                           | Remove `dist`, `node_modules/.vite`                                             |
| `make generate name=my-app [out=PATH]`                                                 | Scaffold micro-app outside this template (default: `../my-app`)                 |
| `make feature name=X [scope=full\|store\|page] label="English" [label-id="Indonesia"]` | Scaffold menu + page (bilingual sidebar labels)                                 |
| `make test-feature`                                                                    | Run generate-feature script tests                                               |

---

## Project structure

Layered layout under `src/` (`config`, `router`, `locales`, `models`, `datasource`, `components`, `layouts`, `features/<name>/`). Full tree and layer rules → [DOCUMENTATION.md § Project Structure](./DOCUMENTATION.md#8-project-structure).

---

## Environment

| Variable                    | Purpose                                      |
| --------------------------- | -------------------------------------------- |
| `VITE_API_BASE_URL`         | Backend base URL                             |
| `VITE_SHOW_DEV_FEATURES`    | Show or hide Documentation & Components menu |
| `VITE_ENABLE_SCROLL_TO_TOP` | Scroll-to-top button (default: true)         |

Set `previewUrl` in `src/config/external-links.json` (or `VITE_OG_SITE_URL` in `.env.production`) to your deployed app URL so link previews use `public/og-image.jpg`.

See `.env` for defaults. Dev vs production overrides and deployment → [DOCUMENTATION.md § Deployment](./DOCUMENTATION.md#18-deployment).

---

## Further reading

| Doc                                          | Content                                                                                                     |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| [VOLTA.md](./VOLTA.md)                       | **Install Volta** (macOS / Linux / Windows)                                                                 |
| [DOCUMENTATION.md](./DOCUMENTATION.md)       | **Deep developer guide** (English): bootstrap, Pinia, routing, data layer, manual page creation, API wiring |
| [DOCUMENTATION.id.md](./DOCUMENTATION.id.md) | Panduan developer mendalam (Bahasa Indonesia)                                                               |
| [README.id.md](./README.id.md)               | This overview in Bahasa Indonesia                                                                           |

In-app **Documentation** / **Components** (DEV badge) during `make dev` link to the published interactive guides.

---

## Stack

- Vue 3 + TypeScript
- Vite 5
- Tailwind CSS 3
- Vue Router 4 + Pinia
- Axios with interceptors
- Volta-pinned Node 22.23.1 / pnpm 11.17.0
