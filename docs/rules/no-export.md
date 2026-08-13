# Disallow using `export` in files containing tests (`no-export`)

Playwright collects test files by running them, not by importing anything they
export. An export in a spec file therefore has no effect on the test run, and
usually means either a helper that belongs in a shared module, or a leftover
from a file that used to be something else.

Keeping helpers out of spec files also avoids a subtle problem: importing a spec
file to reuse an export causes its tests to be registered a second time.

## Rule details

This rule reports every `export` (including `module.exports`) in a file that
contains at least one `test` or `test.describe` call. Files without any tests
are ignored, so fixture and helper modules are unaffected.

Examples of **incorrect** code for this rule

```js
/* eslint playwright/no-export: "error" */

export const url = 'https://example.com'

test('foo', async ({ page }) => {
  await page.goto(url)
})
```

```js
/* eslint playwright/no-export: "error" */

module.exports = { url: 'https://example.com' }

test('foo', async ({ page }) => {})
```

Examples of **correct** code for this rule

```js
/* eslint playwright/no-export: "error" */

import { url } from './helpers.js'

test('foo', async ({ page }) => {
  await page.goto(url)
})
```

```js
/* eslint playwright/no-export: "error" */

// No tests in this file, so exporting is fine
export const url = 'https://example.com'
```
