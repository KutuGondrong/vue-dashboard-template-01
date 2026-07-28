import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export function resolveLocalBin(root, name) {
  const local = path.join(root, 'node_modules', '.bin', name);
  return fs.existsSync(local) ? local : name;
}

/** Run a local bin (prettier/eslint) with paths that may contain spaces. */
export function runLocalBin(root, binName, args, options = {}) {
  const bin = resolveLocalBin(root, binName);
  execFileSync(bin, args, { cwd: root, stdio: 'pipe', ...options });
}

/** Sync directories with rsync; source/dest may contain spaces. */
export function runRsync({ source, dest, deleteExtra = false, excludes = [] }) {
  const args = ['-a'];
  if (deleteExtra) args.push('--delete');
  for (const item of excludes) {
    args.push(`--exclude=${item}`);
  }
  args.push(source, dest);
  execFileSync('rsync', args, { stdio: 'inherit' });
}

export function assertRsyncAvailable() {
  try {
    execFileSync('rsync', ['--version'], { stdio: 'ignore' });
  } catch {
    console.error('rsync is required but was not found in PATH.');
    console.error('');
    console.error('Install rsync:');
    console.error('  macOS: included with macOS (or: brew install rsync)');
    console.error('  Linux: sudo apt install rsync');
    console.error('  Windows: use WSL — sudo apt install rsync');
    console.error('');
    console.error('See VOLTA.md (Node/pnpm) and README Prerequisites: README.md#prerequisites');
    process.exit(1);
  }
}
