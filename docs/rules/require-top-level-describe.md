# Require test cases and hooks to be inside a `test.describe` block (`require-top-level-describe`)

Playwright allows you to organise your test files the way you want it. However,
the more your codebase grows, the more it becomes hard to navigate in your test
files. This rule makes sure you provide at least a top-level `describe` block in
your test file.

## Rule Details

This rule triggers a warning if a test case (`test`) or a hook
(`test.beforeAll`, `test.beforeEach`, `test.afterEach`, `test.afterAll`) is not
located in a top-level `test.describe` block.

The following patterns are considered warnings:

```javascript
// Above a describe block
test('my test', () => {})
test.describe('test suite', () => {
  test('test', () => {})
})

// Below a describe block
test.describe('test suite', () => {})
test('my test', () => {})

// Same for hooks
test.beforeAll('my beforeAll', () => {})
test.describe('test suite', () => {})
test.afterEach('my afterEach', () => {})
```

The following patterns are **not** considered warnings:

```javascript
// In a describe block
test.describe('test suite', () => {
  test('my test', () => {})
})

// In a nested describe block
test.describe('test suite', () => {
  test('my test', () => {})

  test.describe('another test suite', () => {
    test('my other test', () => {})
  })
})
```

You can also enforce a limit on the number of describes allowed at the top-level
using the `maxTopLevelDescribes` option:

```json
{
  "playwright/require-top-level-describe": ["error", { "maxTopLevelDescribes": 2 }]
}
```

Examples of **incorrect** code with the above config:

```javascript
test.describe('test suite', () => {
  test('test', () => {})
})

test.describe('test suite', () => {})
test.describe('test suite', () => {})
```

This option defaults to `Infinity`, allowing any number of top-level describes.
