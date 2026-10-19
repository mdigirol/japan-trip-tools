// Leak guard. data/local/ holds a repo's real itinerary. It is untracked in the public repo.
// A repo that deliberately tracks it (the personal companion) opts in by committing data/local/.tracked-ok.
import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));

function trackedLocalFiles(): string[] {
  try {
    return execFileSync('git', ['ls-files', 'data/local'], { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch {
    return []; // not a git checkout (tarball, sandbox): nothing to check
  }
}

describe('data/local', () => {
  it('is not tracked unless the repo opts in with data/local/.tracked-ok', () => {
    const files = trackedLocalFiles();
    const optedIn = files.includes('data/local/.tracked-ok');
    expect(optedIn ? [] : files, 'data/local files are tracked without data/local/.tracked-ok. Unstage them: git rm -r --cached data/local').toEqual([]);
  });
});
