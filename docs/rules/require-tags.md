# Require test blocks to have tags (`require-tags`)

This rule enforces that all test blocks have at least one tag.

Tags can be specified in the test title (e.g., `@e2e my test`) or in the
options object (e.g., `{ tag: '@e2e' }` or `{ tag: ['@e2e', '@smoke'] }`). Tests
also inherit tags from parent `describe` blocks. Use `allowedFormat` when a
project should accept only one of those formats.

## Rule details

This rule triggers a warning if a test block does not have any tags in an
accepted format and none of its parent `describe` blocks have a tag in an
accepted format. With the default settings, a tag in the title or in the
options object is accepted.

The following patterns are considered warnings:

```js
test('my test', async ({ page }) => {})

test('my test', { timeout: 5000 }, async ({ page }) => {})

test.describe('my suite', () => {
  test('my test', async ({ page }) => {})
})
```

The following patterns are **not** considered warnings:

```js
test('@e2e my test', async ({ page }) => {})

test('my test', { tag: '@e2e' }, async ({ page }) => {})

test('my test', { tag: ['@e2e', '@smoke'] }, async ({ page }) => {})

// Tests inherit tags from parent describe blocks
test.describe('@suite my suite', () => {
  test('my test', async ({ page }) => {})
})

test.describe('my suite', { tag: '@e2e' }, () => {
  test('my test', async ({ page }) => {})
})
```

## Options

This rule accepts an options object. The default keeps the current behavior:
either format satisfies the rule.

```json
{
  "playwright/require-tags": [
    "error",
    {
      "allowedFormat": "both"
    }
  ]
}
```

### `allowedFormat`

Controls which tag format is accepted.

- `"both"` (default) accepts a tag in the title or in the options object.
- `"title"` accepts only tags written in the title, such as
  `test('@e2e my test', ...)`.
- `"options"` accepts only tags in the options object, either as a string
  (`{ tag: '@e2e' }`) or as an array (`{ tag: ['@e2e', '@smoke'] }`).

A tag in a format that is not accepted does not satisfy the rule. When that tag
is present, the rule reports it instead of the generic missing tag message.
This still applies when an accepted tag is present on the same block.

`describe` blocks are not required to have a tag. A tag on a `describe` is
inherited by the tests inside it only when the tag uses an accepted format. A
tag in another format is reported on that `describe` and is not inherited.
Nested `describe` blocks keep inheriting an accepted tag from an outer block.

The same checks apply to `test.skip`, `test.fixme`, `test.only`, `test.fail`,
`test.slow`, and the matching `test.describe` variants (`skip`, `fixme`,
`only`, `serial`, and `parallel`).

Example of **incorrect** code for `{ "allowedFormat": "title" }`:

```js
test('my test', { tag: '@e2e' }, async ({ page }) => {})

test('my test', { tag: ['@e2e', '@smoke'] }, async ({ page }) => {})

// The options tag is not accepted, so the test still needs a title tag
test.describe('my suite', { tag: '@e2e' }, () => {
  test('my test', async ({ page }) => {})
})

// An options tag is reported even when a title tag is also present
test('@e2e my test', { tag: '@slow' }, async ({ page }) => {})
```

Example of **correct** code for `{ "allowedFormat": "title" }`:

```js
test('@e2e my test', async ({ page }) => {})

test('my test @e2e', async ({ page }) => {})

test.describe('@suite my suite', () => {
  test('my test', async ({ page }) => {})
})

test.describe.skip('@suite my suite', () => {
  test('my test', async ({ page }) => {})
})
```

Example of **incorrect** code for `{ "allowedFormat": "options" }`:

```js
test('@e2e my test', async ({ page }) => {})

test('my test @slow', async ({ page }) => {})

// The title tag is not accepted, so the test still needs an options tag
test.describe('@suite my suite', () => {
  test('my test', async ({ page }) => {})
})

// A title tag is reported even when an options tag is also present
test('@e2e my test', { tag: '@slow' }, async ({ page }) => {})
```

Example of **correct** code for `{ "allowedFormat": "options" }`:

```js
test('my test', { tag: '@e2e' }, async ({ page }) => {})

test('my test', { tag: ['@e2e', '@smoke'] }, async ({ page }) => {})

test.describe('my suite', { tag: '@e2e' }, () => {
  test('my test', async ({ page }) => {})
})

test.describe('my suite', { tag: ['@e2e', '@smoke'] }, () => {
  test.skip('my test', async ({ page }) => {})
})
```
