# Volta setup guide

Use [Volta](https://volta.sh) so **Node** and **pnpm** match the pins in [`package.json`](./package.json).

| Pin     | Version     | Why                                     |
| ------- | ----------- | --------------------------------------- |
| Node.js | **22.23.1** | Recommended runtime (Volta pin)         |
| pnpm    | **11.17.0** | Recommended package manager (Volta pin) |

Language: English (this file) · [Bahasa Indonesia](./VOLTA.id.md)

> **Who this is for**
>
> - **App users** - anyone cloning the template or a generated app
> - **Maintainers** - keep `package.json` → `volta` / `engines` / `packageManager` in sync when bumping Node or pnpm

Official Volta pnpm docs: [pnpm Support](https://docs.volta.sh/advanced/pnpm) (`VOLTA_FEATURE_PNPM=1` is needed for pnpm).

**Pins vs install:** If `package.json` already has a `volta` block, you do **not** need `volta pin`. `volta install` only downloads tools onto **this machine** (once per machine, or when pins change). It is not a per-clone step. After setup, `cd` into the repo and Volta shims pick Node **22.23.1** / pnpm **11.17.0** automatically, as long as Volta is first on your `PATH`.

---

## Without Volta

Volta is recommended, but optional. **If you do not use Volta, still install these versions:**

| Tool    | Version               |
| ------- | --------------------- |
| Node.js | **22.23.1** (22.x OK) |
| pnpm    | **11.17.0** (11.x OK) |

Examples:

```bash
# macOS Homebrew
brew install node@22
npm install -g pnpm@11.17.0

# Linux (NodeSource 22.x) then:
npm install -g pnpm@11.17.0
```

Then confirm:

```bash
node -v    # expect v22.23.1 (or v22.x)
pnpm -v    # expect 11.17.0 (or 11.x)
```

Without Volta, versions will **not** switch automatically when you `cd` into the repo. You manage Node/pnpm yourself.

---

## Choose your OS / shell

Pick **one** section below and follow it top to bottom (install → profile → install pins → verify → run the app).

| Environment                         | Section                                        |
| ----------------------------------- | ---------------------------------------------- |
| macOS + zsh (default on modern Mac) | [macOS + zsh](#1-macos--zsh-default)           |
| macOS + bash                        | [macOS + bash](#2-macos--bash)                 |
| Linux / WSL + bash                  | [Linux / WSL + bash](#3-linux--wsl--bash)      |
| Linux / WSL + zsh                   | [Linux / WSL + zsh](#4-linux--wsl--zsh)        |
| Windows + PowerShell                | [Windows + PowerShell](#5-windows--powershell) |

---

## 1. macOS + zsh (default)

macOS Terminal / iTerm use **zsh**. Edit **`~/.zshrc`**.

### Install Volta

```bash
curl https://get.volta.sh | bash
```

Close the terminal completely and open a new one, then confirm:

```bash
volta --version
```

### Configure profile

Append this block at the **end** of `~/.zshrc` (after any nvm / fnm / asdf lines), so Volta wins on `PATH`:

```bash
cat >> ~/.zshrc <<'EOF'

# Volta (keep at end of file so it wins over nvm/fnm/asdf)
export VOLTA_FEATURE_PNPM=1
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
EOF
source ~/.zshrc
```

Confirm the flag:

```bash
echo "$VOLTA_FEATURE_PNPM"    # expect: 1
```

### Install project pins (once per machine)

```bash
volta install node@22.23.1 pnpm@11.17.0
```

### Verify

```bash
which node    # expect: /Users/<you>/.volta/bin/node  (not ~/.nvm/...)
node -v       # expect: v22.23.1 (inside this repo)
pnpm -v       # expect: 11.17.0
```

### Run the project

```bash
cd /path/to/vue-dashboard-template-01   # or your generated app
pnpm install
pnpm run dev
```

---

## 2. macOS + bash

If your login shell is **bash**, edit **`~/.bashrc`** (and ensure `~/.bash_profile` sources it if needed).

### Install Volta

```bash
curl https://get.volta.sh | bash
```

Open a new terminal (or `source ~/.bashrc`), then:

```bash
volta --version
```

### Configure profile

Append at the **end** of `~/.bashrc` (after nvm / fnm / asdf):

```bash
cat >> ~/.bashrc <<'EOF'

# Volta (keep at end of file so it wins over nvm/fnm/asdf)
export VOLTA_FEATURE_PNPM=1
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
EOF
source ~/.bashrc
```

If login shells only read `~/.bash_profile`, either add the same block there or ensure it runs `source ~/.bashrc`.

Confirm:

```bash
echo "$VOLTA_FEATURE_PNPM"    # expect: 1
```

### Install project pins (once per machine)

```bash
volta install node@22.23.1 pnpm@11.17.0
```

### Verify

```bash
which node    # expect: .../.volta/bin/node  (not ~/.nvm/...)
node -v
pnpm -v
```

### Run the project

```bash
cd /path/to/vue-dashboard-template-01
pnpm install
pnpm run dev
```

---

## 3. Linux / WSL + bash

Ubuntu / Debian / Fedora defaults, and WSL Ubuntu, usually use **bash** → **`~/.bashrc`**.

On Windows, install [WSL](https://learn.microsoft.com/windows/wsl/install) first if needed:

```powershell
wsl --install
# reboot if prompted, open "Ubuntu", then continue below
```

### Install Volta

```bash
curl https://get.volta.sh | bash
```

Open a new terminal (or `source ~/.bashrc`), then `volta --version`.

### Configure profile

Append at the **end** of `~/.bashrc` (after nvm / fnm / asdf):

```bash
cat >> ~/.bashrc <<'EOF'

# Volta (keep at end of file so it wins over nvm/fnm/asdf)
export VOLTA_FEATURE_PNPM=1
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
EOF
source ~/.bashrc
```

If login shells only read `~/.bash_profile` / `~/.profile`, add the same block there or `source ~/.bashrc` from those files.

Confirm:

```bash
echo "$VOLTA_FEATURE_PNPM"    # expect: 1
```

### Install project pins (once per machine)

```bash
volta install node@22.23.1 pnpm@11.17.0
```

### Verify

```bash
which node    # expect: .../.volta/bin/node  (not ~/.nvm/...)
node -v
pnpm -v
```

### Run the project

```bash
cd /path/to/vue-dashboard-template-01
pnpm install
pnpm run dev
```

---

## 4. Linux / WSL + zsh

Same as Linux/WSL, but configure **`~/.zshrc`**.

### Install Volta

```bash
curl https://get.volta.sh | bash
```

Close and reopen the terminal, then:

```bash
volta --version
```

### Configure profile

Append at the **end** of `~/.zshrc` (after nvm / fnm / asdf):

```bash
cat >> ~/.zshrc <<'EOF'

# Volta (keep at end of file so it wins over nvm/fnm/asdf)
export VOLTA_FEATURE_PNPM=1
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
EOF
source ~/.zshrc
```

Confirm:

```bash
echo "$VOLTA_FEATURE_PNPM"    # expect: 1
```

### Install project pins (once per machine)

```bash
volta install node@22.23.1 pnpm@11.17.0
```

### Verify

```bash
which node    # expect: .../.volta/bin/node  (not ~/.nvm/...)
node -v
pnpm -v
```

### Run the project

```bash
cd /path/to/vue-dashboard-template-01
pnpm install
pnpm run dev
```

---

## 5. Windows + PowerShell

Native Windows (without WSL). For `make` / `rsync` / `make generate`, WSL is usually smoother ([Linux / WSL + bash](#3-linux--wsl--bash)).

### Install Volta

Install from [https://volta.sh](https://volta.sh), or:

```powershell
winget install Volta.Volta
```

Close PowerShell and open a **new** window:

```powershell
volta --version
```

### Configure profile / environment

Set a **User** environment variable (persists across sessions):

```powershell
[System.Environment]::SetEnvironmentVariable('VOLTA_FEATURE_PNPM', '1', 'User')
```

Or via GUI: Start → **Environment Variables** → User variables → New → Name `VOLTA_FEATURE_PNPM`, Value `1`.

Open a **new** PowerShell, then confirm:

```powershell
echo $env:VOLTA_FEATURE_PNPM   # expect: 1
```

> `$env:VOLTA_FEATURE_PNPM = "1"` only lasts for the current window. Prefer the User variable above.

Ensure Volta’s bin directory is on your user `PATH` (the installer usually adds it). In a new shell, `Get-Command volta` should resolve.

### Install project pins (once per machine)

```powershell
volta install node@22.23.1 pnpm@11.17.0
```

### Verify

```powershell
(Get-Command node).Source   # expect a path under Volta (not nvm)
node -v
pnpm -v
```

### Run the project

```powershell
cd path\to\vue-dashboard-template-01
pnpm install
pnpm run dev
```

---

## After setup

With Volta + `VOLTA_FEATURE_PNPM=1`, entering a folder whose `package.json` has:

```json
"volta": {
  "node": "22.23.1",
  "pnpm": "11.17.0"
}
```

switches tools automatically. No `volta pin` needed when that block already exists. Re-run `volta install` only on a new machine or when pins change.

`pnpm install` does **not** change `node -v`. The active Node comes from `PATH` + the Volta pin.

---

## Troubleshooting

### `echo $VOLTA_FEATURE_PNPM` is empty

The flag is not loaded in this shell. Usual causes:

1. The export was never added to `~/.zshrc` / `~/.bashrc`
2. You added it but did not `source` the file or open a **new** terminal
3. Volta is not installed yet (`volta: command not found`)
4. On Windows native, only a process-scoped variable was set (not a User environment variable)

Fix: re-run the **Configure profile** steps for your OS section, then check again.

### `node -v` still shows nvm (or another manager) after `volta install`

`volta install` succeeded, but another shim is earlier on `PATH`. Common with nvm + Volta.

1. Confirm: `which node` (or `(Get-Command node).Source` on PowerShell). You want `~/.volta/bin/node`, not `~/.nvm/...`.
2. Put the Volta block (`VOLTA_FEATURE_PNPM`, `VOLTA_HOME`, `PATH=...`) at the **end** of your shell config, **after** nvm / fnm / asdf.
3. Open a new terminal. Note: `source ~/.zshrc` can put nvm back in front if the Volta block is not last.

### Other quick fixes

| Symptom                                   | What to try                                                                                                  |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `volta: command not found`                | Reinstall Volta; reopen terminal; check `PATH` includes `$HOME/.volta/bin`                                   |
| `volta install pnpm` fails / ignores pnpm | Set `VOLTA_FEATURE_PNPM=1` first; confirm `echo` prints `1` before install                                   |
| Wrong Node inside the repo                | `cd` into the project; run `volta install node@22.23.1 pnpm@11.17.0`; confirm `which node` is Volta          |
| Works in Terminal.app but not in the IDE  | IDE may not load your shell rc. Restart the IDE after editing, or point the IDE terminal at the same profile |

---

## Maintainers: keep pins aligned

When changing tooling versions, update **all** of these together:

1. `package.json` → `volta.node` / `volta.pnpm`
2. `package.json` → `packageManager` (e.g. `pnpm@11.17.0`, without `+sha512-...`)
3. `package.json` → `engines.node` / `engines.pnpm`
4. `@types/node` major to match the Node pin
5. This file (`VOLTA.md` / `VOLTA.id.md`) and README prerequisites
6. In-app Overview strings in `src/features/tutorial/locales/`

Compatibility reminder: pnpm **11.x** pairs with Node **22+**; keep `volta`, `engines`, and `packageManager` in sync.

---

## Related docs

- [README.md - Prerequisites](./README.md#prerequisites)
- [README.md - Quick Start](./README.md#quick-start)
- [DOCUMENTATION.md - Tech stack](./DOCUMENTATION.md#3-tech-stack--dependencies)
- [Bahasa Indonesia](./VOLTA.id.md)
