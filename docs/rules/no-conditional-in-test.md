# Disallow conditional logic in tests (`no-conditional-in-test`)

Conditional logic in tests is usually an indication that a test is attempting to
cover too much, and not testing the logic it intends to. Each branch of code
executing within a conditional statement will usually be better served by a test
devoted to it.

## Rule Details

Examples of **incorrect** code for this rule:

```javascript
test('foo', async ({ page }) => {
  if (someCondition) {
    bar()
  }
})

test('bar', async ({ page }) => {
  switch (mode) {
    case 'single':
      generateOne()
      break
    case 'double':
      generateTwo()
      break
    case 'multiple':
      generateMany()
      break
  }

  await expect(page.locator('.my-image').count()).toBeGreaterThan(0)
})

test('baz', async ({ page }) => {
  const hotkey = process.platform === 'linux' ? ['Control', 'Alt', 'f'] : ['Alt', 'f']
  await Promise.all(hotkey.map((x) => page.keyboard.down(x)))

  expect(actionIsPerformed()).toBe(true)
})
```

Examples of **correct** code for this rule:

```javascript
test.describe('my tests', () => {
  if (someCondition) {
    test('foo', async ({ page }) => {
      bar()
    })
  }
})

beforeEach(() => {
  switch (mode) {
    case 'single':
      generateOne()
      break
    case 'double':
      generateTwo()
      break
    case 'multiple':
      generateMany()
      break
  }
})

test('bar', async ({ page }) => {
  await expect(page.locator('.my-image').count()).toBeGreaterThan(0)
})

const hotkey = process.platform === 'linux' ? ['Control', 'Alt', 'f'] : ['Alt', 'f']

test('baz', async ({ page }) => {
  await Promise.all(hotkey.map((x) => page.keyboard.down(x)))

  expect(actionIsPerformed()).toBe(true)
})
```
