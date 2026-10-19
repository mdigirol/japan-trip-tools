import { afterEach, describe, expect, it } from 'vitest';
import { basePath, dataDir } from '../../scripts/build-env';

const saved = { BASE_PATH: process.env.BASE_PATH, GITHUB_REPOSITORY: process.env.GITHUB_REPOSITORY };
afterEach(() => {
  for (const [k, v] of Object.entries(saved)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; }
});

describe('basePath', () => {
  it('uses BASE_PATH first, with a trailing slash', () => {
    process.env.BASE_PATH = '/custom';
    expect(basePath()).toBe('/custom/');
  });
  it('uses the repo name on Pages', () => {
    delete process.env.BASE_PATH;
    process.env.GITHUB_REPOSITORY = 'someone/japan-trip-tools';
    expect(basePath()).toBe('/japan-trip-tools/');
  });
});

describe('dataDir', () => {
  it('pins the sample folder when asked', () => {
    expect(dataDir('sample').replace(/\\/g, '/')).toMatch(/\/data\/sample$/);
  });
});
