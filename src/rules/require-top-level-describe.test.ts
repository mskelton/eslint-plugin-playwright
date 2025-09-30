import { javascript, runRuleTester } from '../utils/rule-tester.js'
import rule from './require-top-level-describe.js'

runRuleTester('require-top-level-describe', rule, {
  invalid: [
    // Top level hooks
    {
      code: 'test.beforeAll(() => {})',
      errors: [
        { column: 1, endColumn: 15, line: 1, messageId: 'unexpectedHook' },
      ],
    },
    {
      code: 'test.beforeEach(() => {})',
      errors: [
        { column: 1, endColumn: 16, line: 1, messageId: 'unexpectedHook' },
      ],
    },
    {
      code: 'test.afterAll(() => {})',
      errors: [
        { column: 1, endColumn: 14, line: 1, messageId: 'unexpectedHook' },
      ],
    },
    {
      code: 'test.afterEach(() => {})',
      errors: [
        { column: 1, endColumn: 15, line: 1, messageId: 'unexpectedHook' },
      ],
    },
    {
      code: 'test["afterEach"](() => {})',
      errors: [
        { column: 1, endColumn: 18, line: 1, messageId: 'unexpectedHook' },
      ],
    },
    {
      code: 'test[`afterEach`](() => {})',
      errors: [
        { column: 1, endColumn: 18, line: 1, messageId: 'unexpectedHook' },
      ],
    },
    {
      code: javascript`
        test.describe("suite", () => {});
        test.afterAll(() => {})
      `,
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 2,
          line: 2,
          messageId: 'unexpectedHook',
        },
      ],
    },
    // Top level tests
    {
      code: 'test("foo", () => {})',
      errors: [
        { column: 1, endColumn: 5, line: 1, messageId: 'unexpectedTest' },
      ],
    },
    {
      code: 'test.skip("foo", () => {})',
      errors: [
        { column: 1, endColumn: 10, line: 1, messageId: 'unexpectedTest' },
      ],
    },
    {
      code: 'test.fixme("foo", () => {})',
      errors: [
        { column: 1, endColumn: 11, line: 1, messageId: 'unexpectedTest' },
      ],
    },
    {
      code: 'test.only("foo", () => {})',
      errors: [
        { column: 1, endColumn: 10, line: 1, messageId: 'unexpectedTest' },
      ],
    },
    {
      code: 'test["only"]("foo", () => {})',
      errors: [
        { column: 1, endColumn: 13, line: 1, messageId: 'unexpectedTest' },
      ],
    },
    {
      code: 'test[`only`]("foo", () => {})',
      errors: [
        { column: 1, endColumn: 13, line: 1, messageId: 'unexpectedTest' },
      ],
    },
    {
      code: 'test("foo", { tag: ["@fast"] }, () => {})',
      errors: [
        { column: 1, endColumn: 5, line: 1, messageId: 'unexpectedTest' },
      ],
    },
    {
      code: javascript`
        test("foo", () => {})
        test.describe("suite", () => {});
      `,
      errors: [
        { column: 1, endColumn: 5, line: 1, messageId: 'unexpectedTest' },
      ],
    },
    {
      code: javascript`
        test("foo", () => {})
        test.describe("suite", () => {
          test("bar", () => {})
        });
      `,
      errors: [
        { column: 1, endColumn: 5, line: 1, messageId: 'unexpectedTest' },
      ],
    },
    // Too many describes
    {
      code: javascript`
        test.describe('one', () => {});
        test.describe.only('two', () => {});
        test.describe.parallel('three', () => {});
      `,
      errors: [
        {
          column: 1,
          data: { amount: 2, s: 's' },
          endColumn: 23,
          line: 3,
          messageId: 'tooManyDescribes',
        },
      ],
      options: [{ maxTopLevelDescribes: 2 }],
    },
    {
      code: javascript`
        test.describe('one', () => {
          test.describe('one (nested)', () => {});
          test.describe('two (nested)', () => {});
        });

        test["describe"].only('two', () => {
          test.describe('one (nested)', () => {});
          test.describe.serial.only('two (nested)', () => {});
          test.describe.fixme('three (nested)', () => {});
        });

        test[\`describe\`][\`fixme\`]('three', () => {
          test.describe('one (nested)', () => {});
          test.describe.serial('two (nested)', () => {});
          test.describe.parallel('three (nested)', () => {});
        });
      `,
      errors: [
        {
          column: 1,
          data: { amount: 2, s: 's' },
          endColumn: 26,
          line: 12,
          messageId: 'tooManyDescribes',
        },
      ],
      options: [{ maxTopLevelDescribes: 2 }],
    },
    {
      code: javascript`
        test.describe('one', () => {});
        test.describe.fixme.only('two', () => {});
        test.describe.fixme('three', () => {});
      `,
      errors: [
        {
          column: 1,
          data: { amount: 1, s: '' },
          endColumn: 25,
          line: 2,
          messageId: 'tooManyDescribes',
        },
        {
          column: 1,
          data: { amount: 1, s: '' },
          endColumn: 20,
          line: 3,
          messageId: 'tooManyDescribes',
        },
      ],
      options: [{ maxTopLevelDescribes: 1 }],
    },
    // Global aliases
    {
      code: 'it.beforeAll(() => {})',
      errors: [
        { column: 1, endColumn: 13, line: 1, messageId: 'unexpectedHook' },
      ],
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
  valid: [
    'foo()',
    'test.info()',
    'test.use({ locale: "en-US" })',
    'test.skip(({ browserName }) => browserName === "Chrome");',
    'test.skip();',
    'test.skip(true);',
    'test.skip(browserName === "Chrome", "This feature is skipped on Chrome")',
    'test.slow(({ browserName }) => browserName === "Chrome");',
    'test.slow();',
    'test.slow(browserName === "webkit", "This feature is slow on Mac")',
    'test.describe.configure({ mode: "parallel" })',
    'test.describe("suite", () => { test("foo") });',
    'test.describe.only("suite", () => { test.beforeAll("my beforeAll") });',
    'test.describe.parallel("suite", () => { test.beforeEach("my beforeAll") });',
    'test.describe.serial("suite", () => { test.afterAll("my afterAll") });',
    'test.describe.parallel.fixme("suite", () => { test.afterEach("my afterEach") });',
    javascript`
      test.describe("suite", () => {
        test.beforeEach("a", () => {});
        test.describe("b", () => {});
        test("c", () => {})
      });
    `,
    javascript`
      test.describe("suite", () => {
        test("foo", () => {})
        test.describe("another suite", () => {});
        test("my other test", () => {})
      });
    `,
    javascript`
      test.describe('one', () => {});
      test.describe('two', () => {});
      test.describe('three', () => {});
    `,
    javascript`
      test.describe("suite", () => {
        test("foo", { tag: ["@slow"] }, () => {})
        test.describe("another suite", { tag: ["@slow"] }, () => {});
        test("my other test", () => {})
      });
    `,
    {
      code: javascript`
        test.describe('one', () => {
          test.describe('two', () => {});
          test.describe('three', () => {});
        });
      `,
      options: [{ maxTopLevelDescribes: 1 }],
    },
    // Global aliases
    {
      code: 'it.info()',
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
})
