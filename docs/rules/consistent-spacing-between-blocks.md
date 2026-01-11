# Enforce consistent spacing between test blocks (`enforce-consistent-spacing-between-blocks`)

Ensure that there is a consistent spacing between test blocks.

## Rule Details

Examples of **incorrect** code for this rule:

```javascript
test('example 1', () => {
  expect(true).toBe(true)
})
test('example 2', () => {
  expect(true).toBe(true)
})
```

```javascript
test.beforeEach(() => {})
test('example 3', () => {
  await test.step('first', async () => {
    expect(true).toBe(true)
  })
  await test.step('second', async () => {
    expect(true).toBe(true)
  })
})
```

Examples of **correct** code for this rule:

```javascript
test('example 1', () => {
  expect(true).toBe(true)
})

test('example 2', () => {
  expect(true).toBe(true)
})
```

```javascript
test.beforeEach(() => {})

test('example 3', () => {
  await test.step('first', async () => {
    expect(true).toBe(true)
  })

  await test.step('second', async () => {
    expect(true).toBe(true)
  })
})
```
