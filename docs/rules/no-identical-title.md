# Disallow identical titles (`no-identical-title`)

Having identical titles for two different tests or test suites may create
confusion. For example, when a test fails, the title is used to locate it in the
source — duplicate titles mean the report is ambiguous, and reporters that group
results by title (including the HTML reporter and most CI integrations) will
merge unrelated tests together.

Playwright does not report duplicate titles as an error, so they tend to go
unnoticed until someone is debugging a failure.

## Rule details

This rule looks at the title of every `test` and `test.describe` block within
the same `describe` scope and reports when a title is used more than once. Tests
and describe blocks are compared separately, and each `describe` block starts a
new scope, so repeating a title in a sibling or nested block is allowed.

Examples of **incorrect** code for this rule

```js
/* eslint playwright/no-identical-title: "error" */

test('foo', async ({ page }) => {})
test('foo', async ({ page }) => {})

test.describe('foo', () => {})
test.describe('foo', () => {})

test.describe('parent', () => {
  test('bar', async ({ page }) => {})
  test('bar', async ({ page }) => {})
})
```

Examples of **correct** code for this rule

```js
/* eslint playwright/no-identical-title: "error" */

test('foo', async ({ page }) => {})
test('bar', async ({ page }) => {})

// A test and a describe block may share a title
test.describe('foo', () => {})
test('foo', async ({ page }) => {})

// Each describe block has its own scope
test.describe('parent 1', () => {
  test('foo', async ({ page }) => {})
})
test.describe('parent 2', () => {
  test('foo', async ({ page }) => {})
})
```

Titles that can't be compared statically, such as `test(\`foo ${bar}\`, ...)`,
are ignored.
