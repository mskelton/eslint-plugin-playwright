# Disallow assertions on a Locator that can never fail (`no-unnecessary-assertions`)

A Playwright `Locator` is a synchronous handle — it is always defined, never
null, and always truthy. So generic value matchers applied directly to a locator
assert nothing about the page and **can never fail**: the test stays green
whether the feature works or not.

This is the bare-locator gap left by
[`prefer-web-first-assertions`](./prefer-web-first-assertions.md), which only
rewrites the awaited-method form (`expect(await locator.isVisible()).toBe(true)`).
`expect-expect` doesn't catch it either, because an `expect()` is present.

## Rule Details

Examples of **incorrect** code for this rule:

```js
expect(page.getByText('Dashboard')).toBeDefined()
expect(page.locator('.user-badge')).toBeTruthy()
expect(page.getByRole('button')).not.toBeNull()

const badge = page.getByTestId('badge')
expect(badge).not.toBeUndefined()
```

Examples of **correct** code for this rule:

```js
await expect(page.getByText('Dashboard')).toBeVisible()

// Non-locator subjects genuinely need these matchers.
expect(count).toBeDefined()

// Real expectations that can actually fail on a locator are not flagged.
expect(page.locator('.x')).toBeNull()
expect(page.getByRole('button')).not.toBeDefined()
```

The rule reports `toBeDefined` / `toBeTruthy` and the negated `not.toBeNull` /
`not.toBeUndefined` / `not.toBeFalsy` when the `expect()` subject resolves to an
inline locator chain (anchored by `locator` / `getBy*`). Locators stored in a
variable are resolved to their definition, so `const x = page.getByRole(...)`
followed by `expect(x).toBeDefined()` is caught too. Polarity is respected:
`toBeNull()` / `not.toBeDefined()` can actually fail on a locator, so they are
left alone.

The autofix rewrites to `await expect(locator).toBeVisible()` — the same
conservative default as `prefer-web-first-assertions`. It only runs inside an
`async` function, so `--fix` never emits `await` in a synchronous callback, and
it reuses an existing `await` rather than producing `await await`.
