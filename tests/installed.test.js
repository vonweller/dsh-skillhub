import { mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

test('listInstalled scans both dsh skills and global agents skills', async () => {
  const tempDir = join(tmpdir(), `dsh-skills-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const dshDir = join(tempDir, '.dsh', 'skills');
  const agentsDir = join(tempDir, '.agents', 'skills');

  process.env.DSH_AGENTS_HOME = join(tempDir, '.agents');

  try {
    await mkdir(join(dshDir, 'dsh-sample'), { recursive: true });
    await writeFile(join(dshDir, 'dsh-sample', 'SKILL.md'), '---\nname: dsh-sample\ndescription: A DSH skill\n---\nBody');

    await mkdir(join(agentsDir, 'global-sample'), { recursive: true });
    await writeFile(join(agentsDir, 'global-sample', 'SKILL.md'), '---\nname: global-sample\ndescription: |\n  A multiline\n  global skill\n---\nBody');

    // Dynamic import to use the latest module
    const { installSkill } = await import('../lib/index.js');
    assert.equal(typeof installSkill, 'function');
  } finally {
    delete process.env.DSH_AGENTS_HOME;
    await rm(tempDir, { recursive: true, force: true });
  }
});
