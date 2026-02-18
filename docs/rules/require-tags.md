# Require test blocks to have tags (`require-tags`)

This rule enforces that all test blocks have at least one tag.

Tags can be specified in the test title (e.g., `@e2e my test`) or in the
options object (e.g., `{ tag: '@e2e' }`). Tests also inherit tags from parent
`describe` blocks.

## Rule details

This rule triggers a warning if a test block does not have any tags and none of
its parent `describe` blocks have tags.

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
