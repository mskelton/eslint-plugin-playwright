# Require a reason for `.skip()` and `.fixme()` annotations (`require-annotation-reason`)

The enforceable team norm is rarely "never skip a test" — sometimes a test
genuinely can't run on mobile, or is parked against a known bug. It's "never
skip a test silently."

`test.skip(isMobile)` tells the next reader nothing. Six months later nobody
knows whether the underlying problem was fixed, whether the condition still
holds, or who to ask, so the annotation stays forever and the coverage never
comes back. `test.skip(isMobile, 'ref WET-204 — layout breaks below 768px')`
costs nothing to write and answers all three questions.

That's a norm most teams can turn on at `error` immediately, which is not true
of a blanket prohibition on skipping.

## Rule details

This rule checks the conditional form of Playwright's annotations, where
`description` is a documented parameter:

```javascript
test.skip(condition, description)
```

By default `skip` and `fixme` are checked. `fail` and `slow` don't remove
coverage the same way, so they're opt-in via [`annotations`](#annotations).

Examples of **incorrect** code for this rule:

```javascript
test('checkout flow', async ({ isMobile, page }) => {
  test.skip(isMobile)
  // ...
})

test('legacy report', async ({ isMobile }) => {
  test.fixme(isMobile, '')
})

test.describe('admin', () => {
  test.skip()

  test('foo', async () => {})
})
```

Examples of **correct** code for this rule:

```javascript
test('checkout flow', async ({ isMobile, page }) => {
  test.skip(isMobile, 'ref WET-204 — layout breaks below 768px')
  // ...
})

test.describe('admin', () => {
  test.skip(({ browserName }) => browserName === 'firefox', 'ref WET-88')

  test('foo', async () => {})
})
```

### What is not checked

The declaration form has nowhere to put a description — Playwright's
`test.skip(title, body)` signature has no `description` parameter — so it is not
reported:

```javascript
// Not reported by this rule
test.skip('checkout flow', async ({ page }) => {})
test.describe.fixme('admin', () => {})
```

Those are what [`no-skipped-test`](./no-skipped-test.md) is for. The two rules
are complementary and independent: this one governs _how_ an annotation is
written, that one governs _whether_ it may be used at all. Enabling this rule
does not require enabling that one.

A reason whose value isn't known statically is accepted as present, but cannot
be checked against [`pattern`](#pattern):

```javascript
test.skip(isMobile, buildSkipReason(ticket)) // accepted, not pattern-checked
test.skip(isMobile, `ref ${ticket}`) // accepted, not pattern-checked
test.skip(isMobile, `ref WET-204`) // checked — no interpolation
```

## Options

### `annotations`

The annotations to check. Defaults to `["fixme", "skip"]`. Valid entries are
`"fail"`, `"fixme"`, `"skip"`, and `"slow"`.

```json
{
  "playwright/require-annotation-reason": ["error", { "annotations": ["skip", "fixme", "fail"] }]
}
```

### `pattern`

A regular expression the reason must match. Unset by default, in which case any
non-empty reason is accepted.

Use it to require a ticket reference, turning a convention that today survives
only on code review into something CI enforces:

```json
{
  "playwright/require-annotation-reason": ["error", { "pattern": "\\b[A-Z]+-\\d+\\b" }]
}
```

With the above configuration:

```javascript
test.fixme(isMobile, 'ref WET-204') // correct
test.fixme(isMobile, 'flaky') // incorrect — no ticket reference
```

The pattern is matched against the trimmed reason with the `u` flag, and only
needs to match somewhere in it, so surrounding prose is fine.
