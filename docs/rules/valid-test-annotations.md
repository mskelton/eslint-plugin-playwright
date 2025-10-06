# Valid Test Annotations

This rule ensures that test annotations in Playwright test files follow the
correct format according to Playwright's annotation API.

## Rule Details

This rule enforces the following:

1. Annotations must be objects with a `type` property (not strings, numbers, or
   other primitives)
2. The `type` property must be a string
3. The optional `description` property must be a string
4. Only `type` and `description` properties are allowed in annotation objects
5. Tags should not be placed inside annotations (use the separate `tag` property
   instead)

### Examples

```ts
// Valid
test('my test', { annotation: { type: 'issue' } }, async ({ page }) => {})

test(
  'my test',
  {
    annotation: {
      type: 'issue',
      description: 'https://github.com/microsoft/playwright/issues/23180',
    },
  },
  async ({ page }) => {},
)

// Valid with array of annotations
test(
  'my test',
  {
    annotation: [
      { type: 'issue', description: 'BUG-123' },
      { type: 'performance' },
    ],
  },
  async ({ page }) => {},
)

// Valid with tag (separate properties)
test(
  'my test',
  {
    tag: '@e2e',
    annotation: { type: 'issue', description: 'BUG-123' },
  },
  async ({ page }) => {},
)

// Valid in test.describe
test.describe(
  'group',
  { annotation: { type: 'category', description: 'report' } },
  () => {},
)

// Valid in test.skip, test.fixme, test.only
test.skip(
  'my test',
  { annotation: { type: 'issue', description: 'BUG-123' } },
  async ({ page }) => {},
)

// Invalid - string instead of object
test('my test', { annotation: 'bug' }, async ({ page }) => {})

// Invalid - number instead of object
test('my test', { annotation: 123 }, async ({ page }) => {})

// Invalid - array with string instead of object
test('my test', { annotation: ['bug'] }, async ({ page }) => {})

// Invalid - tag property inside annotation
test(
  'my test',
  { annotation: { tag: ['@XRAY-123'] } },
  async ({ page }) => {},
)

// Invalid - missing type property
test(
  'my test',
  { annotation: { description: 'some description' } },
  async ({ page }) => {},
)

// Invalid - type is not a string
test(
  'my test',
  { annotation: { type: 123, description: 'desc' } },
  async ({ page }) => {},
)

// Invalid - description is not a string
test(
  'my test',
  { annotation: { type: 'issue', description: 123 } },
  async ({ page }) => {},
)

// Invalid - unknown property
test(
  'my test',
  {
    annotation: { type: 'issue', description: 'desc', invalid: true },
  },
  async ({ page }) => {},
)
```

## Rationale

Playwright's annotation API expects annotations to be objects with a `type`
property and an optional `description` property. Using incorrect formats can
lead to:

1. Annotations not appearing in test reports
2. Confusion between tags and annotations
3. Runtime errors or unexpected behavior

Common mistakes this rule prevents:

- Using strings like `annotation: "bug"` instead of
  `annotation: { type: "bug" }`
- Mixing up tags and annotations by putting `tag` inside `annotation`
- Missing the required `type` property
- Using non-string values for `type` or `description`

## Further Reading

- [Playwright Test Annotations Documentation](https://playwright.dev/docs/test-annotations)
- [Playwright Test Tags Documentation](https://playwright.dev/docs/test-annotations#tag-tests)

