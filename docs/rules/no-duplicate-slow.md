# Disallow multiple `test.slow()` calls in the same test (`no-duplicate-slow`)

Calling `test.slow()` multiple times in the same test will multiply the timeout
each time. For example, two `test.slow()` calls will triple the timeout twice
(9x the original), not just apply a single slow multiplier.

This rule prevents accidentally extending test timeouts far beyond intended
limits.

## Rule details

Examples of **incorrect** code for this rule:

```js
test('should do something', async ({ page }) => {
  test.slow()
  await doSomething()
  test.slow() // This triples the already tripled timeout (9x total)
})
```

```js
test('should do something', async ({ page }) => {
  await test.step('complete first form', async () => {
    test.slow()
    await fillForm()
  })

  await test.step('complete other form', async () => {
    test.slow() // Bad - results in 9x timeout
    await page.reload()
    await fillForm()
  })
})
```

Examples of **correct** code for this rule:

```js
test('should do something', async ({ page }) => {
  test.slow()
  await doSomething()
})
```

```js
test('should do something', async ({ browserName }) => {
  test.slow(browserName === 'firefox', 'Slow on Firefox')
  await doSomething()
})
```

```js
// Different tests can each have their own test.slow()
test('test one', async ({ page }) => {
  test.slow()
  await doSomething()
})

test('test two', async ({ page }) => {
  test.slow()
  await doSomething()
})
```
