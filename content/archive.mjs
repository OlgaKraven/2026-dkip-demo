import { execFileSync } from 'node:child_process';

const tar = process.platform === 'win32' ? 'tar.exe' : 'bsdtar';

export function archiveEntries(file) {
  const bytes = execFileSync(tar, ['-tf', file]);
  const names = bytes.toString('utf8');
  // The Windows tool uses the system ANSI code page for redirected output.
  return (process.platform === 'win32' && names.includes('\uFFFD')
    ? new TextDecoder('windows-1251').decode(bytes)
    : names).trimEnd().split(/\r?\n/);
}

export const archiveEntry = (file, entry) => execFileSync(tar, ['-xOf', file, entry]);
