# Panduan setup Volta

Pakai [Volta](https://volta.sh) agar **Node** dan **pnpm** cocok dengan pin di [`package.json`](./package.json).

| Pin     | Versi       | Alasan                                      |
| ------- | ----------- | ------------------------------------------- |
| Node.js | **22.23.1** | Runtime yang disarankan (pin Volta)         |
| pnpm    | **11.17.0** | Package manager yang disarankan (pin Volta) |

Bahasa: Bahasa Indonesia (dokumen ini) · [English](./VOLTA.md)

> **Untuk siapa**
>
> - **Pengguna app** - yang clone template atau app hasil generate
> - **Maintainer** - jaga agar `package.json` → `volta` / `engines` / `packageManager` sinkron saat bump Node atau pnpm

Dokumentasi resmi Volta untuk pnpm: [pnpm Support](https://docs.volta.sh/advanced/pnpm) (`VOLTA_FEATURE_PNPM=1` dibutuhkan untuk pnpm).

**Pin vs install:** Jika `package.json` sudah punya blok `volta`, Anda **tidak** perlu `volta pin`. `volta install` hanya mengunduh tool ke **mesin ini** (sekali per mesin, atau saat pin berubah). Bukan langkah tiap clone. Setelah setup, `cd` ke repo dan shim Volta memilih Node **22.23.1** / pnpm **11.17.0** otomatis, selama Volta menang di `PATH`.

---

## Tanpa Volta

Volta disarankan, tapi opsional. **Kalau tidak pakai Volta, tetap install versi ini:**

| Tool    | Versi                 |
| ------- | --------------------- |
| Node.js | **22.23.1** (22.x OK) |
| pnpm    | **11.17.0** (11.x OK) |

Contoh:

```bash
# macOS Homebrew
brew install node@22
npm install -g pnpm@11.17.0

# Linux (NodeSource 22.x) lalu:
npm install -g pnpm@11.17.0
```

Lalu cek:

```bash
node -v    # expect v22.23.1 (atau v22.x)
pnpm -v    # expect 11.17.0 (atau 11.x)
```

Tanpa Volta, versi **tidak** berganti otomatis saat `cd` ke repo. Anda kelola Node/pnpm sendiri.

---

## Pilih OS / shell

Pilih **satu** bagian di bawah dan ikuti dari atas ke bawah (install → profile → install pin → verifikasi → jalankan app).

| Environment                      | Bagian                                         |
| -------------------------------- | ---------------------------------------------- |
| macOS + zsh (default Mac modern) | [macOS + zsh](#1-macos--zsh-default)           |
| macOS + bash                     | [macOS + bash](#2-macos--bash)                 |
| Linux / WSL + bash               | [Linux / WSL + bash](#3-linux--wsl--bash)      |
| Linux / WSL + zsh                | [Linux / WSL + zsh](#4-linux--wsl--zsh)        |
| Windows + PowerShell             | [Windows + PowerShell](#5-windows--powershell) |

---

## 1. macOS + zsh (default)

Terminal / iTerm di macOS memakai **zsh**. Edit **`~/.zshrc`**.

### Install Volta

```bash
curl https://get.volta.sh | bash
```

Tutup terminal sepenuhnya, buka lagi, lalu cek:

```bash
volta --version
```

### Configure profile

Tambahkan blok ini di **akhir** `~/.zshrc` (setelah baris nvm / fnm / asdf), agar Volta menang di `PATH`:

```bash
cat >> ~/.zshrc <<'EOF'

# Volta (taruh di akhir file agar menang dari nvm/fnm/asdf)
export VOLTA_FEATURE_PNPM=1
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
EOF
source ~/.zshrc
```

Konfirmasi flag:

```bash
echo "$VOLTA_FEATURE_PNPM"    # expect: 1
```

### Install pin project (sekali per mesin)

```bash
volta install node@22.23.1 pnpm@11.17.0
```

### Verifikasi

```bash
which node    # expect: /Users/<anda>/.volta/bin/node  (bukan ~/.nvm/...)
node -v       # expect: v22.23.1 (di dalam repo ini)
pnpm -v       # expect: 11.17.0
```

### Jalankan project

```bash
cd /path/ke/vue-dashboard-template-01   # atau app hasil generate
pnpm install
pnpm run dev
```

---

## 2. macOS + bash

Jika login shell Anda **bash**, edit **`~/.bashrc`** (pastikan `~/.bash_profile` me-`source` file itu jika perlu).

### Install Volta

```bash
curl https://get.volta.sh | bash
```

Buka terminal baru (atau `source ~/.bashrc`), lalu:

```bash
volta --version
```

### Configure profile

Tambahkan di **akhir** `~/.bashrc` (setelah nvm / fnm / asdf):

```bash
cat >> ~/.bashrc <<'EOF'

# Volta (taruh di akhir file agar menang dari nvm/fnm/asdf)
export VOLTA_FEATURE_PNPM=1
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
EOF
source ~/.bashrc
```

Jika login shell hanya membaca `~/.bash_profile`, tambahkan blok yang sama di sana atau pastikan file itu menjalankan `source ~/.bashrc`.

Konfirmasi:

```bash
echo "$VOLTA_FEATURE_PNPM"    # expect: 1
```

### Install pin project (sekali per mesin)

```bash
volta install node@22.23.1 pnpm@11.17.0
```

### Verifikasi

```bash
which node    # expect: .../.volta/bin/node  (bukan ~/.nvm/...)
node -v
pnpm -v
```

### Jalankan project

```bash
cd /path/ke/vue-dashboard-template-01
pnpm install
pnpm run dev
```

---

## 3. Linux / WSL + bash

Ubuntu / Debian / Fedora, dan WSL Ubuntu, biasanya **bash** → **`~/.bashrc`**.

Di Windows, install [WSL](https://learn.microsoft.com/windows/wsl/install) dulu jika perlu:

```powershell
wsl --install
# restart jika diminta, buka "Ubuntu", lalu lanjut di bawah
```

### Install Volta

```bash
curl https://get.volta.sh | bash
```

Buka terminal baru (atau `source ~/.bashrc`), lalu `volta --version`.

### Configure profile

Tambahkan di **akhir** `~/.bashrc` (setelah nvm / fnm / asdf):

```bash
cat >> ~/.bashrc <<'EOF'

# Volta (taruh di akhir file agar menang dari nvm/fnm/asdf)
export VOLTA_FEATURE_PNPM=1
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
EOF
source ~/.bashrc
```

Jika login shell hanya membaca `~/.bash_profile` / `~/.profile`, tambahkan blok yang sama di sana atau `source ~/.bashrc` dari file tersebut.

Konfirmasi:

```bash
echo "$VOLTA_FEATURE_PNPM"    # expect: 1
```

### Install pin project (sekali per mesin)

```bash
volta install node@22.23.1 pnpm@11.17.0
```

### Verifikasi

```bash
which node    # expect: .../.volta/bin/node  (bukan ~/.nvm/...)
node -v
pnpm -v
```

### Jalankan project

```bash
cd /path/ke/vue-dashboard-template-01
pnpm install
pnpm run dev
```

---

## 4. Linux / WSL + zsh

Sama seperti Linux/WSL, tetapi konfigurasi di **`~/.zshrc`**.

### Install Volta

```bash
curl https://get.volta.sh | bash
```

Tutup dan buka ulang terminal, lalu:

```bash
volta --version
```

### Configure profile

Tambahkan di **akhir** `~/.zshrc` (setelah nvm / fnm / asdf):

```bash
cat >> ~/.zshrc <<'EOF'

# Volta (taruh di akhir file agar menang dari nvm/fnm/asdf)
export VOLTA_FEATURE_PNPM=1
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
EOF
source ~/.zshrc
```

Konfirmasi:

```bash
echo "$VOLTA_FEATURE_PNPM"    # expect: 1
```

### Install pin project (sekali per mesin)

```bash
volta install node@22.23.1 pnpm@11.17.0
```

### Verifikasi

```bash
which node    # expect: .../.volta/bin/node  (bukan ~/.nvm/...)
node -v
pnpm -v
```

### Jalankan project

```bash
cd /path/ke/vue-dashboard-template-01
pnpm install
pnpm run dev
```

---

## 5. Windows + PowerShell

Windows native (tanpa WSL). Untuk `make` / `rsync` / `make generate`, biasanya lebih nyaman pakai WSL ([Linux / WSL + bash](#3-linux--wsl--bash)).

### Install Volta

Install dari [https://volta.sh](https://volta.sh), atau:

```powershell
winget install Volta.Volta
```

Tutup PowerShell, buka jendela **baru**:

```powershell
volta --version
```

### Configure profile / environment

Set **User** environment variable (bertahan antar sesi):

```powershell
[System.Environment]::SetEnvironmentVariable('VOLTA_FEATURE_PNPM', '1', 'User')
```

Atau lewat GUI: Start → **Environment Variables** → User variables → New → Name `VOLTA_FEATURE_PNPM`, Value `1`.

Buka PowerShell **baru**, lalu cek:

```powershell
echo $env:VOLTA_FEATURE_PNPM   # expect: 1
```

> `$env:VOLTA_FEATURE_PNPM = "1"` hanya berlaku di jendela itu. Lebih baik pakai User variable di atas.

Pastikan bin Volta ada di user `PATH` (installer biasanya menambahkannya). Di shell baru, `Get-Command volta` harus resolve.

### Install pin project (sekali per mesin)

```powershell
volta install node@22.23.1 pnpm@11.17.0
```

### Verifikasi

```powershell
(Get-Command node).Source   # expect path di bawah Volta (bukan nvm)
node -v
pnpm -v
```

### Jalankan project

```powershell
cd path\to\vue-dashboard-template-01
pnpm install
pnpm run dev
```

---

## Setelah setup

Dengan Volta + `VOLTA_FEATURE_PNPM=1`, masuk ke folder yang `package.json`-nya punya:

```json
"volta": {
  "node": "22.23.1",
  "pnpm": "11.17.0"
}
```

akan mengganti tool otomatis. Tidak perlu `volta pin` jika blok itu sudah ada. Jalankan ulang `volta install` hanya di mesin baru atau saat pin berubah.

`pnpm install` **tidak** mengubah `node -v`. Node yang aktif ditentukan oleh `PATH` + pin Volta.

---

## Troubleshooting

### `echo $VOLTA_FEATURE_PNPM` kosong

Flag belum aktif di shell ini. Penyebab umum:

1. Belum menambah export ke `~/.zshrc` / `~/.bashrc`
2. Sudah ditambah tapi belum `source` atau belum buka terminal **baru**
3. Volta belum terpasang (`volta: command not found`)
4. Di Windows native, yang di-set hanya variabel sesi, bukan **User** environment variable

Perbaikan: ulangi langkah **Configure profile** di bagian OS Anda, lalu cek lagi.

### `node -v` masih nvm (atau manager lain) meski `volta install` sukses

`volta install` berhasil, tapi shim lain lebih dulu di `PATH`. Sering terjadi saat campur nvm + Volta.

1. Cek: `which node` (atau `(Get-Command node).Source` di PowerShell). Yang diharapkan: `~/.volta/bin/node`, bukan `~/.nvm/...`.
2. Taruh blok Volta (`VOLTA_FEATURE_PNPM`, `VOLTA_HOME`, `PATH=...`) di **akhir** file shell config, **setelah** nvm / fnm / asdf.
3. Buka terminal baru. Catatan: `source ~/.zshrc` bisa mengembalikan nvm ke depan jika blok Volta belum di akhir file.

### Perbaikan singkat lainnya

| Gejala                                           | Coba                                                                                           |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `volta: command not found`                       | Install ulang Volta; buka ulang terminal; pastikan `PATH` berisi `$HOME/.volta/bin`            |
| `volta install pnpm` gagal / mengabaikan pnpm    | Set `VOLTA_FEATURE_PNPM=1` dulu; pastikan `echo` mencetak `1` sebelum install                  |
| Node salah versi di dalam repo                   | `cd` ke project; `volta install node@22.23.1 pnpm@11.17.0`; pastikan `which node` adalah Volta |
| Jalan di Terminal.app tapi tidak di terminal IDE | IDE mungkin tidak load shell rc. Restart IDE setelah edit, atau samakan profile shell IDE      |

---

## Maintainer: jaga pin tetap selaras

Saat mengubah versi tooling, update **semuanya** bersamaan:

1. `package.json` → `volta.node` / `volta.pnpm`
2. `package.json` → `packageManager` (contoh `pnpm@11.17.0`, tanpa `+sha512-...`)
3. `package.json` → `engines.node` / `engines.pnpm`
4. Major `@types/node` agar selaras dengan pin Node
5. File ini (`VOLTA.md` / `VOLTA.id.md`) dan Prerequisites di README
6. String Overview in-app di `src/features/tutorial/locales/`

Pengingat kompatibilitas: pnpm **11.x** berpasangan dengan Node **22+**; jaga `volta`, `engines`, dan `packageManager` tetap selaras.

---

## Dokumen terkait

- [README.id.md - Prasyarat](./README.id.md#prasyarat)
- [README.md - Prerequisites](./README.md#prerequisites) (English, install per OS)
- [DOCUMENTATION.id.md - Tech stack](./DOCUMENTATION.id.md#id-3-tech-stack--dependensi)
- [English](./VOLTA.md)
