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

test('skip using testInfo', async ({ page }, testInfo) => {
  testInfo.skip()
})
```

With the `disallowFixme` option enabled, the following are also incorrect:

```javascript
test.fixme('temporarily disabled', async ({ page }) => {})

test.fixme() // marks all tests in the file as fixme

test.describe.fixme('skip this describe', () => {})

test('fixme using testInfo', async ({ page }, testInfo) => {
  testInfo.fixme()
})
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

`allowConditional` can also be an object to configure the `skip` and `fixme`
annotations separately, which is useful if you rely on conditional skips but
never want to allow `.fixme()`:

```json
{
  "playwright/no-skipped-test": [
    "error",
    {
      "allowConditional": { "fixme": false, "skip": true },
      "disallowFixme": true
    }
  ]
}
```

Examples of **incorrect** code for the
`{ "allowConditional": { "skip": true }, "disallowFixme": true }` option:

```javascript
test('foo', ({ isMobile }) => {
  test.fixme(isMobile, 'Not ready for mobile yet')
  expect(1).toBe(1)
})
```

Example of **correct** code for the same option:

```javascript
test('foo', ({ browserName }) => {
  test.skip(browserName === 'firefox', 'Still working on it')
  expect(1).toBe(1)
})
```

The inverse is just as common, and is arguably the more useful of the two: a
team that treats `.fixme()` as documentation for a known, ticketed bug wants
conditional `.fixme()` allowed while still catching an unconditional skip that
someone left behind.

```json
{
  "playwright/no-skipped-test": [
    "error",
    {
      "allowConditional": { "fixme": true, "skip": false },
      "disallowFixme": true
    }
  ]
}
```

Example of **correct** code for that option:

```javascript
test('foo', ({ isMobile }) => {
  test.fixme(isMobile, 'ref WET-204 — layout breaks below 768px')
  expect(1).toBe(1)
})
```

Examples of **incorrect** code for the same option:

```javascript
// Unconditional — nothing says when this comes back
test.fixme('foo', ({}) => {
  expect(1).toBe(1)
})

test('bar', ({ browserName }) => {
  test.skip(browserName === 'firefox', 'Still working on it')
  expect(1).toBe(1)
})
```

Passing a boolean is equivalent to setting both keys to that value, so
`{ "allowConditional": true }` is the same as
`{ "allowConditional": { "fixme": true, "skip": true } }`.

### `disallowFixme`

Setting this option to `true` will also disallow the `.fixme()` annotation
(`test.fixme()`, `test.describe.fixme()`, `testInfo.fixme()`, etc.). Default is
`false`.
