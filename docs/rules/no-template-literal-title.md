# Disallow template literals in test, describe, and step titles (`no-template-literal-title`)

A test title is an identifier. It is what the HTML reporter groups by, what
`--grep` matches, what a flake dashboard keys on, and what a reviewer searches
for after CI fails. Interpolating a value into it means the title only exists
once the data does, and changes when the data changes:

- `npx playwright test --grep "login as admin"` matches nothing you can predict
  from the source, and neither does a code search for a title pasted from a
  failing run.
- A title that reads `upload invoice-8842.pdf` on one run and
  `upload invoice-9130.pdf` on the next is two different tests to anything that
  tracks results over time, so flake detection and quarantine lists silently
  stop working.
- The interpolated value can also give false confidence: `${user.role}` prints
  `admin`, but the failure may depend on the rest of `user`.

A template literal with no interpolation has none of those problems — it is just
an inconsistent quote style, and an invitation to add interpolation later. This
rule reports it too, with an autofix that converts it to a string literal.

Where the data genuinely varies, prefer a form that keeps the title stable and
puts the value somewhere it can be read: distinct static titles at the loop
site, the value in a `test.step` body, or `test.info().annotations` so it lands
in the report as data.

## Rule details

Examples of **incorrect** code for this rule:

```js
test(`login as ${user.role}`, async ({ page }) => {
  // ...
})

test.describe(`${env.NAME} checkout`, () => {
  test('adds an item', async ({ page }) => {
    await test.step(`upload ${file.name}`, async () => {
      // ...
    })
  })
})

// No interpolation, but still a template literal
test(`checkout completes`, async ({ page }) => {
  // ...
})
```

Examples of **correct** code for this rule:

```js
test('login as admin', async ({ page }) => {
  // ...
})

test.describe('checkout', () => {
  test('adds an item', async ({ page }) => {
    await test.step('upload the invoice', async () => {
      // ...
    })
  })
})

// Record the varying value as data rather than as the name
test('uploads an invoice', async ({ page }) => {
  test.info().annotations.push({ description: file.name, type: 'file' })
})

// Template literals outside of titles are untouched
test('checkout', async ({ page }) => {
  await page.locator(`#${id}`).click()
})
```

## Options

### `ignore`

An array of the callers to skip, matching the `ignore` option used by
[`prefer-lowercase-title`](prefer-lowercase-title.md). Valid values are `test`,
`test.describe`, and `test.step`.

```json
{
  "rules": {
    "playwright/no-template-literal-title": ["error", { "ignore": ["test"] }]
  }
}
```

Example of **correct** code with `{ "ignore": ["test"] }`:

```js
test(`login as ${user.role}`, async ({ page }) => {
  // ...
})
```

This is useful if your suite deliberately generates parameterized test titles
but you still want stable `test.describe` and `test.step` names.
