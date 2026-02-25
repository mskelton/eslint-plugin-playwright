---
name: create-rule
description: Create a new ESLint rule for eslint-plugin-playwright. Use when asked to implement a new rule, add a rule, or create a lint rule for this plugin.
---

# Create a New ESLint Rule

## Steps

### 1. Create the rule file: `src/rules/{rule-name}.ts`

```typescript
import { createRule } from '../utils/createRule.js'
import { parseFnCall } from '../utils/parseFnCall.js'

export default createRule({
  create(context) {
    return {
      CallExpression(node) {
        const call = parseFnCall(context, node)
        if (!call) return
        // Rule logic here
      },
    }
  },
  meta: {
    docs: {
      description: 'Rule description',
      recommended: true,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/{rule-name}.md',
    },
    messages: {
      messageId: 'Error message with optional {{ interpolation }}',
    },
    schema: [],
    type: 'problem', // or 'suggestion'
    // fixable: 'code',     // add if auto-fixable
    // hasSuggestions: true, // add if suggestion-fixable
  },
})
```

Key utilities (all imported from `../utils/`):

- `parseFnCall` — parse Playwright calls (test, expect, describe, hook, step, config)
- `isTypeOfFnCall` — check call type without full parse
- `isPageMethod` — check if call is page method
- `getStringValue`, `isIdentifier`, `findParent`, `dereference` — AST helpers
- `replaceAccessorFixer`, `removePropertyFixer` — fixer helpers

### 2. Create the test file: `src/rules/{rule-name}.test.ts`

```typescript
import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
import rule from './{rule-name}.js'

runRuleTester('{rule-name}', rule, {
  invalid: [
    {
      code: dedent`
        test('example', async ({ page }) => {
          // code that should trigger the rule
        })
      `,
      errors: [{ messageId: 'messageId' }],
    },
    // Global alias test
    {
      code: `it('example', () => { /* bad */ })`,
      errors: [{ messageId: 'messageId' }],
      settings: { playwright: { globalAliases: { test: ['it'] } } },
    },
  ],
  valid: [
    // code that should NOT trigger the rule
    `test('example', async ({ page }) => { /* correct usage */ })`,
  ],
})
```

Use `runTSRuleTester` (from same import) for TypeScript-specific rules.

### 3. Register in `src/plugin.ts`

Add the import (alphabetical order):

```typescript
import myNewRule from './rules/{rule-name}.js'
```

Add to the `plugin.rules` object (alphabetical order):

```typescript
'{rule-name}': myNewRule,
```

If recommended, add to `sharedConfig.rules`:

```typescript
'playwright/{rule-name}': 'error', // or 'warn'
```

### 4. Create docs: `docs/rules/{rule-name}.md`

```markdown
# Description of rule (`{rule-name}`)

Explain why this rule exists and what problem it prevents.

## Rule details

Examples of **incorrect** code for this rule:

\`\`\`js
// bad example
\`\`\`

Examples of **correct** code for this rule:

\`\`\`js
// good example
\`\`\`

## Options

_If rule has options, document them here. Otherwise omit this section._
```

### 5. Add to README.md rules table

Insert a row in alphabetical order in the table (around line 120+):

```markdown
| [{rule-name}](https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/{rule-name}.md) | Description of rule | ✅ | 🔧 | 💡 |
```

Leave columns blank (`   `) when not applicable:

- `✅` — rule is in recommended config
- `🔧` — rule is auto-fixable (`fixable: 'code'`)
- `💡` — rule has suggestions (`hasSuggestions: true`)

## Verify

Run tests to confirm everything works:

```bash
yarn test <rule-name>
```
