# Disallow usage of the `.skip` annotation (`no-skipped-test`)

## Rule Details

Examples of **incorrect** code for this rule:

```javascript
test.skip('skip this test', async ({ page }) => {})

test.describe.skip('skip two tests', () => {
  test('one', async ({ page }) => {})
  test('two', async ({ page }) => {})
})

test.describe('skip test inside describe', () => {
  test.skip()
})

test.describe('skip test conditionally', async ({ browserName }) => {
  test.skip(browserName === 'firefox', 'Working on it')
})
```

With the `disallowFixme` option enabled, the following are also incorrect:

```javascript
test.fixme('temporarily disabled', async ({ page }) => {})

test.fixme() // marks all tests in the file as fixme

test.describe.fixme('skip this describe', () => {})
```

Examples of **correct** code for this rule:

```javascript
test('this test', async ({ page }) => {})

test.describe('two tests', () => {
  test('one', async ({ page }) => {})
  test('two', async ({ page }) => {})
})
```

## Options

```json
{
  "playwright/no-skipped-test": [
    "error",
    {
      "allowConditional": false,
      "disallowFixme": false
    }
  ]
}
```

### `allowConditional`

Setting this option to `true` will allow using `test.skip()` to
[conditionally skip a test](https://playwright.dev/docs/test-annotations#conditionally-skip-a-test).
This can be helpful if you want to prevent usage of `test.skip` being added by
mistake but still allow conditional tests based on browser/environment setup.

Examples of **incorrect** code for the `{ "allowConditional": true }` option:

```javascript
test.skip('foo', ({}) => {
  expect(1).toBe(1)
})

test('foo', ({}) => {
  test.skip()
  expect(1).toBe(1)
})
```

Example of **correct** code for the `{ "allowConditional": true }` option:

```javascript
test('foo', ({ browserName }) => {
  test.skip(browserName === 'firefox', 'Still working on it')
  expect(1).toBe(1)
})
```

### `disallowFixme`

Setting this option to `true` will also disallow the `.fixme()` annotation
(`test.fixme()`, `test.describe.fixme()`, etc.). Default is `false`.
