import type { Rule } from 'eslint'
import { describe, expect, it } from 'vitest'
import { getImportedAliases } from './ast.js'

describe('getImportedAliases', () => {
  it('supports ImportSpecifier.imported as Literal', () => {
    // Intentionally construct a nonstandard/synthetic AST: in valid JS parsed by
    // standard ESTree parsers, `ImportSpecifier.imported` is an Identifier.
    // Here we use a Literal ('test') to ensure `getImportedAliases` gracefully
    // handles such shapes and still treats `import { test as it }` as aliasing.
    const program: any = {
      body: [
        {
          source: {
            raw: "'@playwright/test'",
            type: 'Literal',
            value: '@playwright/test',
          },
          specifiers: [
            {
              imported: { raw: "'test'", type: 'Literal', value: 'test' },
              local: { name: 'it', type: 'Identifier' },
              type: 'ImportSpecifier',
            },
          ],
          type: 'ImportDeclaration',
        },
      ],
      sourceType: 'module',
      type: 'Program',
    }

    const context = {
      sourceCode: { ast: program },
    } as unknown as Rule.RuleContext
    const aliases = getImportedAliases(context, 'test')
    expect(aliases).toEqual(['it'])
  })
})
