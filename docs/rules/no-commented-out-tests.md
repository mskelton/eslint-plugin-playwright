# Disallow commented out tests (`no-commented-out-tests`)

This rule raises a warning about commented out tests. It's similar to
`no-skipped-test` rule.

## Rule details

The rule uses fuzzy matching to do its best to determine what constitutes a
commented out test, checking for a presence of `test(`, `test.describe(`,
`test.skip(`, etc. in code comments.

The following patterns are considered warnings:

```js
// describe('foo', () => {});
// test.describe('foo', () => {});
// test('foo', () => {});

// test.describe.skip('foo', () => {});
// test.skip('foo', () => {});

// test.describe['skip']('bar', () => {});
// test['skip']('bar', () => {});

/*
test.describe('foo', () => {});
*/
```

These patterns would not be considered warnings:

```js
describe('foo', () => {})
test.describe('foo', () => {})
test('foo', () => {})

test.describe.only('bar', () => {})
test.only('bar', () => {})

// foo('bar', () => {});
```

### Limitations

The plugin looks at the literal function names within test code, so will not
catch more complex examples of commented out tests, such as:

```js
// const testSkip = test.skip;
// testSkip('skipped test', () => {});

// const custom = test.extend({});
// custom('does not have function body');
```
