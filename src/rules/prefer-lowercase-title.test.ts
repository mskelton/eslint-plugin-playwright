import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
import rule from './prefer-lowercase-title.js'

const messageId = 'unexpectedLowercase'

runRuleTester('prefer-lowercase-title', rule, {
  invalid: [
    {
      code: "test('Foo',  () => {})",
      errors: [
        {
          column: 6,
          data: { method: 'test' },
          endColumn: 11,
          line: 1,
          messageId,
        },
      ],
      output: "test('foo',  () => {})",
    },
    {
      code: 'test(`Foo bar`,  () => {})',
      errors: [
        {
          column: 6,
          data: { method: 'test' },
          endColumn: 15,
          line: 1,
          messageId,
        },
      ],
      output: 'test(`foo bar`,  () => {})',
    },
    {
      code: "test.skip('Foo Bar',  () => {})",
      errors: [
        {
          column: 11,
          data: { method: 'test' },
          endColumn: 20,
          line: 1,
          messageId,
        },
      ],
      output: "test.skip('foo Bar',  () => {})",
    },
    {
      code: 'test.skip(`Foo`,  () => {})',
      errors: [
        {
          column: 11,
          data: { method: 'test' },
          endColumn: 16,
          line: 1,
          messageId,
        },
      ],
      output: 'test.skip(`foo`,  () => {})',
    },
    {
      code: "test['fixme']('Foo',  () => {})",
      errors: [
        {
          column: 15,
          data: { method: 'test' },
          endColumn: 20,
          line: 1,
          messageId,
        },
      ],
      output: "test['fixme']('foo',  () => {})",
    },
    {
      code: 'test[`only`](`Foo`,  () => {})',
      errors: [
        {
          column: 14,
          data: { method: 'test' },
          endColumn: 19,
          line: 1,
          messageId,
        },
      ],
      output: 'test[`only`](`foo`,  () => {})',
    },
    {
      code: "test.describe('Foo bar',  () => {})",
      errors: [
        {
          column: 15,
          data: { method: 'test.describe' },
          endColumn: 24,
          line: 1,
          messageId,
        },
      ],
      output: "test.describe('foo bar',  () => {})",
    },
    {
      code: 'test[`describe`](`Foo Bar`,  () => {})',
      errors: [
        {
          column: 18,
          data: { method: 'test.describe' },
          endColumn: 27,
          line: 1,
          messageId,
        },
      ],
      output: 'test[`describe`](`foo Bar`,  () => {})',
    },
    {
      code: "test.describe.skip('Foo',  () => {})",
      errors: [
        {
          column: 20,
          data: { method: 'test.describe' },
          endColumn: 25,
          line: 1,
          messageId,
        },
      ],
      output: "test.describe.skip('foo',  () => {})",
    },
    {
      code: "test.describe.fixme('Foo',  () => {})",
      errors: [
        {
          column: 21,
          data: { method: 'test.describe' },
          endColumn: 26,
          line: 1,
          messageId,
        },
      ],
      output: "test.describe.fixme('foo',  () => {})",
    },
    {
      code: 'test[`describe`]["only"]("Foo",  () => {})',
      errors: [
        {
          column: 26,
          data: { method: 'test.describe' },
          endColumn: 31,
          line: 1,
          messageId,
        },
      ],
      output: 'test[`describe`]["only"]("foo",  () => {})',
    },
    {
      code: "test.describe.parallel.skip('Foo',  () => {})",
      errors: [
        {
          column: 29,
          data: { method: 'test.describe' },
          endColumn: 34,
          line: 1,
          messageId,
        },
      ],
      output: "test.describe.parallel.skip('foo',  () => {})",
    },
    {
      code: 'test.describe.parallel.fixme(`Foo`,  () => {})',
      errors: [
        {
          column: 30,
          data: { method: 'test.describe' },
          endColumn: 35,
          line: 1,
          messageId,
        },
      ],
      output: 'test.describe.parallel.fixme(`foo`,  () => {})',
    },
    {
      code: 'test.describe.parallel.only("Foo",  () => {})',
      errors: [
        {
          column: 29,
          data: { method: 'test.describe' },
          endColumn: 34,
          line: 1,
          messageId,
        },
      ],
      output: 'test.describe.parallel.only("foo",  () => {})',
    },
    {
      code: "test.describe.serial.skip('Foo',  () => {})",
      errors: [
        {
          column: 27,
          data: { method: 'test.describe' },
          endColumn: 32,
          line: 1,
          messageId,
        },
      ],
      output: "test.describe.serial.skip('foo',  () => {})",
    },
    {
      code: 'test.describe.serial.fixme(`Foo`,  () => {})',
      errors: [
        {
          column: 28,
          data: { method: 'test.describe' },
          endColumn: 33,
          line: 1,
          messageId,
        },
      ],
      output: 'test.describe.serial.fixme(`foo`,  () => {})',
    },
    {
      code: 'test.describe.serial.only("Foo",  () => {})',
      errors: [
        {
          column: 27,
          data: { method: 'test.describe' },
          endColumn: 32,
          line: 1,
          messageId,
        },
      ],
      output: 'test.describe.serial.only("foo",  () => {})',
    },
    // Global aliases
    {
      code: "it('Foo',  () => {})",
      errors: [
        {
          column: 4,
          data: { method: 'test' },
          endColumn: 9,
          line: 1,
          messageId,
        },
      ],
      output: "it('foo',  () => {})",
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
    {
      code: "it.describe('Foo',  () => {})",
      errors: [
        {
          column: 13,
          data: { method: 'test.describe' },
          endColumn: 18,
          line: 1,
          messageId,
        },
      ],
      output: "it.describe('foo',  () => {})",
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
    {
      code: dedent`
        const custom = test.extend({});
        custom('Foo',  () => {});
      `,
      errors: [
        {
          column: 8,
          data: { method: 'test' },
          endColumn: 13,
          line: 2,
          messageId,
        },
      ],
      output: dedent`
        const custom = test.extend({});
        custom('foo',  () => {});
      `,
    },
    {
      code: dedent`
        const custom = test.extend({});
        custom.describe('Foo',  () => {});
      `,
      errors: [
        {
          column: 17,
          data: { method: 'test.describe' },
          endColumn: 22,
          line: 2,
          messageId,
        },
      ],
      output: dedent`
        const custom = test.extend({});
        custom.describe('foo',  () => {});
      `,
    },
    {
      code: dedent`
        import { test as custom } from '@playwright/test';
        custom('Foo',  () => {});
      `,
      errors: [
        {
          column: 8,
          data: { method: 'test' },
          endColumn: 13,
          line: 2,
          messageId,
        },
      ],
      output: dedent`
        import { test as custom } from '@playwright/test';
        custom('foo',  () => {});
      `,
    },
  ],
  valid: [
    'randomFunction()',
    'foo.bar()',
    "test('foo Bar', () => {})",
    'test(`foo`, () => {})',
    'test("<Foo/>", () => {})',
    'test("123 foo", () => {})',
    'test("42", () => {})',
    'test(``, () => {})',
    'test("", () => {})',
    'test(42, () => {})',
    "test.fixme('foo', () => {})",
    "test.skip('foo', () => {})",
    "test.only('foo Bar', () => {})",
    'test["fixme"]("foo", () => {})',
    'test["skip"](`foo`, () => {})',
    'test.describe()',
    "test.describe('foo Bar', () => {})",
    'test.describe(`foo`, () => {})',
    'test["describe"]("<Foo/>", () => {})',
    'test[`describe`]("123 foo", () => {})',
    'test.describe("42", () => {})',
    'test.describe(``)',
    'test.describe("")',
    'test.describe(42)',
    "test.describe.skip('foo Bar', () => {})",
    'test.describe.skip(`foo`, () => {})',
    "test.describe.fixme('foo', () => {})",
    "test.describe.only('foo', () => {})",
    "test.describe.parallel.skip('foo Bar', () => {})",
    'test.describe.parallel.skip(`foo`, () => {})',
    "test.describe.parallel.fixme('foo', () => {})",
    "test.describe.parallel.only('foo Bar Baz', () => {})",
    "test.describe.serial.skip('foo', () => {})",
    "test.describe[`serial`].fixme('foo', () => {})",
    "test.describe['serial'].only('foo', () => {})",
    {
      code: dedent`
        import { test as custom } from '@playwright/test';
        custom("foo", () => {});
      `,
    },
  ],
})

runRuleTester('prefer-lowercase-title with ignore=test.describe', rule, {
  invalid: [
    {
      code: "test('Foo', () => {})",
      errors: [
        {
          column: 6,
          data: { method: 'test' },
          endColumn: 11,
          line: 1,
          messageId,
        },
      ],
      options: [{ ignore: ['test.describe'] }],
      output: "test('foo', () => {})",
    },
  ],
  valid: [
    {
      code: "test.describe('Foo', () => {})",
      options: [{ ignore: ['test.describe'] }],
    },
    {
      code: 'test.describe.parallel(`Foo`, () => {})',
      options: [{ ignore: ['test.describe'] }],
    },
    {
      code: 'test.describe.skip(`Foo`, () => {})',
      options: [{ ignore: ['test.describe'] }],
    },
  ],
})

runRuleTester('prefer-lowercase-title with ignore=test', rule, {
  invalid: [
    {
      code: "test.describe('Foo', () => {})",
      errors: [
        {
          column: 15,
          data: { method: 'test.describe' },
          endColumn: 20,
          line: 1,
          messageId,
        },
      ],
      options: [{ ignore: ['test'] }],
      output: "test.describe('foo', () => {})",
    },
  ],
  valid: [
    {
      code: "test('Foo', () => {})",
      options: [{ ignore: ['test'] }],
    },
    {
      code: 'test(`Foo`, () => {})',
      options: [{ ignore: ['test'] }],
    },
    {
      code: 'test.only(`Foo`, () => {})',
      options: [{ ignore: ['test'] }],
    },
  ],
})

runRuleTester('prefer-lowercase-title with allowedPrefixes', rule, {
  invalid: [
    {
      code: 'test(`POST /live`, () => {})',
      errors: [
        {
          column: 6,
          data: { method: 'test' },
          endColumn: 18,
          line: 1,
          messageId,
        },
      ],
      options: [{ allowedPrefixes: ['GET'] }],
      output: 'test(`pOST /live`, () => {})',
    },
  ],
  valid: [
    {
      code: "test('GET /live', () => {})",
      options: [{ allowedPrefixes: ['GET'] }],
    },
    {
      code: 'test("POST /live", () => {})',
      options: [{ allowedPrefixes: ['GET', 'POST'] }],
    },
    {
      code: 'test(`PATCH /live`, () => {})',
      options: [{ allowedPrefixes: ['GET', 'PATCH'] }],
    },
  ],
})

runRuleTester('prefer-lowercase-title with ignoreTopLevelDescribe', rule, {
  invalid: [
    {
      code: 'test("Works!", () => {});',
      errors: [
        {
          column: 6,
          data: { method: 'test' },
          endColumn: 14,
          line: 1,
          messageId,
        },
      ],
      options: [{ ignoreTopLevelDescribe: true }],
      output: 'test("works!", () => {});',
    },
    {
      code: dedent`
        test.describe('MyClass', () => {
          test.describe('MyMethod', () => {
            test('Does things', () => {});
          });
        });
      `,
      errors: [
        {
          column: 17,
          data: { method: 'test.describe' },
          endColumn: 27,
          line: 2,
          messageId,
        },
        {
          column: 10,
          data: { method: 'test' },
          endColumn: 23,
          line: 3,
          messageId,
        },
      ],
      options: [{ ignoreTopLevelDescribe: true }],
      output: dedent`
        test.describe('MyClass', () => {
          test.describe('myMethod', () => {
            test('does things', () => {});
          });
        });
      `,
    },
  ],
  valid: [
    'test("already lower", () => {});',
    'test.describe("already lower", () => {});',
    {
      code: 'describe("MyClass", () => {});',
      options: [{ ignoreTopLevelDescribe: true }],
    },
    {
      code: dedent`
        test.describe('MyClass', () => {
          test.describe('#myMethod', () => {
            test('does things', () => {});
          });
        });
      `,
      options: [{ ignoreTopLevelDescribe: true }],
    },
    // Global aliases
    {
      code: 'it("already lower", () => {});',
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
    {
      code: 'it.describe("already lower", () => {});',
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
    {
      code: dedent`
        const custom = test.extend({});
        custom("already lower", () => {});
      `,
      options: [{ ignoreTopLevelDescribe: true }],
    },
    {
      code: dedent`
        const custom = test.extend({});
        custom.describe("already lower", () => {});
      `,
      options: [{ ignoreTopLevelDescribe: true }],
    },
    {
      code: dedent`
        import { test as custom } from '@playwright/test';
        custom("already lower", () => {});
      `,
    },
  ],
})
