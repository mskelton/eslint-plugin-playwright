import fs from 'node:fs/promises'
import path from 'node:path'
import { expect, test } from 'vitest'

const plugin = await import('../../src/index.js')

test('exports all rules', async () => {
  const files = await fs.readdir('src/rules')
  const { rules } = plugin.configs['flat/recommended'].plugins.playwright
  const ruleKeys = Object.keys(rules).sort()
  const fileKeys = files
    .filter((file) => !file.endsWith('.test.ts'))
    .map((file) => file.replace('.ts', ''))
    .sort()

  expect(ruleKeys).toEqual(fileKeys)
})

test('has all rules in the README', async () => {
  const readme = await fs.readFile(path.resolve(__dirname, '../../README.md'), 'utf-8')

  const { rules } = plugin.configs['flat/recommended'].plugins.playwright

  for (const rule of Object.keys(rules)) {
    expect(readme).toContain(`[${rule}]`)
  }
})
