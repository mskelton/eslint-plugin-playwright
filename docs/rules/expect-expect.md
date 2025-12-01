# Enforce assertion to be made in a test body (`expect-expect`)

Ensure that there is at least one `expect` call made in a test.

## Rule Details

Examples of **incorrect** code for this rule:

```javascript
test('should be a test', () => {
  console.log('no assertion')
})

test('should assert something', () => {})
```

Examples of **correct** code for this rule:

```javascript
test('should be a test', async () => {
  await expect(page).toHaveTitle('foo')
})

test('should work with callbacks/async', async () => {
  await test.step('step 1', async () => {
    await expect(page).toHaveTitle('foo')
  })
})
```

## Options

```json
{
  "playwright/expect-expect": [
    "error",
    {
      "assertFunctionNames": ["assertCustomCondition"],
      "assertFunctionPatterns": ["^assert.*", "^verify.*"]
    }
  ]
}
```

### `assertFunctionNames`

This array option specifies the names of functions that should be considered to
be asserting functions.

```ts
/* eslint playwright/expect-expect: ["error", { "assertFunctionNames": ["assertScrolledToBottom"] }] */

function assertScrolledToBottom(page) {
  // ...
}

test('should scroll', async ({ page }) => {
  await assertScrolledToBottom(page)
})
```

### `assertFunctionPatterns`

This array option specifies regular expression patterns that should match
function names to be considered as asserting functions. This is useful when you
have multiple assertion functions following a naming convention.

```ts
/* eslint playwright/expect-expect: ["error", { "assertFunctionPatterns": ["^assert.*", "^verify.*"] }] */

function assertScrolledToBottom(page) {
  // ...
}

function verifyPageLoaded(page) {
  // ...
}

test('should scroll', async ({ page }) => {
  await assertScrolledToBottom(page)
  await verifyPageLoaded(page)
})
```

You can use both `assertFunctionNames` and `assertFunctionPatterns` together.
The rule will consider a function as an assertion if it matches either an exact
name or a pattern.
