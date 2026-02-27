import fs from 'node:fs/promises'
import { expect, test } from 'vitest'

const { flatConfig } = await import('../../src/plugin.ts')

test('exports all rules', async () => {
  const files = await fs.readdir(new URL('../../src/rules/', import.meta.url))
  const { rules } = flatConfig.plugins.playwright
  const ruleKeys = Object.keys(rules).sort()
  const fileKeys = files
    .filter((file) => !file.endsWith('.test.ts'))
    .map((file) => file.replace('.ts', ''))
    .sort()

  expect(ruleKeys).toEqual(fileKeys)
})

function getReadmeRow(readme: string, rule: string) {
  return readme.split('\n').find((line) => line.includes(`[${rule}]`))
}

test('rules properly documented in README', async () => {
  const readme = await fs.readFile(new URL('../../README.md', import.meta.url), 'utf-8')
  const { rules } = flatConfig.plugins.playwright
  const recommendedRules = new Set(
    Object.keys(flatConfig.rules).map((key) => key.replace('playwright/', '')),
  )

  for (const [name, rule] of Object.entries(rules)) {
    const row = getReadmeRow(readme, name)
    expect(row, `Rule ${name} not found in README`).toBeDefined()

    const columns = row!.split('|').map((col) => col.trim())

    expect(columns[3] === '✅', `Rule ${name} recommended mismatch`).toBe(
      recommendedRules.has(name),
    )
    expect(columns[4] === '🔧', `Rule ${name} fixable mismatch`).toBe(!!rule.meta?.fixable)
    expect(columns[5] === '💡', `Rule ${name} suggestions mismatch`).toBe(
      !!rule.meta?.hasSuggestions,
    )
  }
})
