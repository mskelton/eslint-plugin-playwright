import assert from 'node:assert'
import fs from 'node:fs/promises'
import { test } from 'vitest'

const { flatConfig } = await import('../../src/plugin.ts')

test('exports all rules', async () => {
  const files = await fs.readdir(new URL('../../src/rules/', import.meta.url))
  const { rules } = flatConfig.plugins.playwright
  const ruleKeys = Object.keys(rules).sort()
  const fileKeys = files
    .filter((file) => !file.endsWith('.test.ts'))
    .map((file) => file.replace('.ts', ''))
    .sort()

  assert.deepEqual(ruleKeys, fileKeys)
})

test('has all rules in the README', async () => {
  const readme = await fs.readFile(new URL('../../README.md', import.meta.url), 'utf-8')

  const { rules } = flatConfig.plugins.playwright

  for (const rule of Object.keys(rules)) {
    assert.ok(readme.includes(`[${rule}]`))
  }
})
