// Build-time settings shared by vite, vitest, playwright and the scripts in this folder.
//
// Data: the app reads its itinerary from data/local/ when data/local/trip.json exists, otherwise from
// data/sample/. data/local/ is untracked here (see .gitignore), so a repo that wants real data has to
// opt in with data/local/.tracked-ok (see tests/unit/data-local.test.ts). Files are never mixed:
// if data/local/trip.json exists, every data file comes from data/local/.
//
// Base path: the repo name on Pages (GITHUB_REPOSITORY), else the folder name, else BASE_PATH.
import { existsSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

export type DataMode = 'auto' | 'sample';

const root = fileURLToPath(new URL('..', import.meta.url));

export function dataDir(mode: DataMode = 'auto'): string {
  const local = join(root, 'data', 'local');
  return mode === 'auto' && existsSync(join(local, 'trip.json')) ? local : join(root, 'data', 'sample');
}

export const dataFile = (name: string, mode: DataMode = 'auto'): string => join(dataDir(mode), name);

export function basePath(): string {
  const set = process.env.BASE_PATH;
  if (set) return set.endsWith('/') ? set : `${set}/`;
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? basename(root);
  return `/${repo}/`;
}

// Resolves `@data/<file>` imports to the active data folder. Pass 'sample' to pin the sample data.
export function dataPlugin(mode: DataMode = 'auto'): Plugin {
  return {
    name: 'trip-data',
    enforce: 'pre',
    resolveId(id) {
      if (!id.startsWith('@data/')) return null;
      const [name, query] = id.slice('@data/'.length).split('?');
      return dataFile(name, mode) + (query ? `?${query}` : '');
    }
  };
}
