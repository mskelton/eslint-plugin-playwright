import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
import rule from './no-duplicate-hooks.js'

runRuleTester('basic describe block', rule, {
  invalid: [
    {
      code: dedent`
        test.describe("foo", () => {
          test.beforeEach(() => {}),
          test.beforeEach(() => {}),
          test("bar", () => {
            someFn();
          })
        })
      `,
      errors: [
        {
          column: 3,
          data: { hook: 'beforeEach' },
          line: 3,
          messageId: 'noDuplicateHook',
        },
      ],
    },
    {
      code: dedent`
        describe.skip("foo", () => {
          test.beforeEach(() => {}),
          test.beforeAll(() => {}),
          test.beforeAll(() => {}),
          test("bar", () => {
            someFn();
          })
        })
      `,
      errors: [
        {
          column: 3,
          data: { hook: 'beforeAll' },
          line: 4,
          messageId: 'noDuplicateHook',
        },
      ],
    },
    {
      code: dedent`
        describe.skip("foo", () => {
          test.afterEach(() => {}),
          test.afterEach(() => {}),
          test("bar", () => {
            someFn();
          })
        })
      `,
      errors: [
        {
          column: 3,
          data: { hook: 'afterEach' },
          line: 3,
          messageId: 'noDuplicateHook',
        },
      ],
    },
    {
      code: dedent`
        describe.skip("foo", () => {
          test.afterAll(() => {}),
          test.afterAll(() => {}),
          test("bar", () => {
            someFn();
          })
        })
      `,
      errors: [
        {
          column: 3,
          data: { hook: 'afterAll' },
          line: 3,
          messageId: 'noDuplicateHook',
        },
      ],
    },
    {
      code: dedent`
        test.afterAll(() => {}),
        test.afterAll(() => {}),
        test("bar", () => {
          someFn();
        })
      `,
      errors: [
        {
          column: 1,
          data: { hook: 'afterAll' },
          line: 2,
          messageId: 'noDuplicateHook',
        },
      ],
    },
    {
      code: dedent`
        test.describe("foo", () => {
          test.beforeEach(() => {}),
          test.beforeEach(() => {}),
          test.beforeEach(() => {}),
          test("bar", () => {
            someFn();
          })
        })
      `,
      errors: [
        {
          column: 3,
          data: { hook: 'beforeEach' },
          line: 3,
          messageId: 'noDuplicateHook',
        },
        {
          column: 3,
          data: { hook: 'beforeEach' },
          line: 4,
          messageId: 'noDuplicateHook',
        },
      ],
    },
    {
      code: dedent`
        describe.skip("foo", () => {
          test.afterAll(() => {}),
          test.afterAll(() => {}),
          test.beforeAll(() => {}),
          test.beforeAll(() => {}),
          test("bar", () => {
            someFn();
          })
        })
      `,
      errors: [
        {
          column: 3,
          data: { hook: 'afterAll' },
          line: 3,
          messageId: 'noDuplicateHook',
        },
        {
          column: 3,
          data: { hook: 'beforeAll' },
          line: 5,
          messageId: 'noDuplicateHook',
        },
      ],
    },
    // Global aliases
    {
      code: dedent`
        it.describe("foo", () => {
          it.beforeEach(() => {}),
          it.beforeEach(() => {}),
          it("bar", () => {
            someFn();
          })
        })
      `,
      errors: [
        {
          column: 3,
          data: { hook: 'beforeEach' },
          line: 3,
          messageId: 'noDuplicateHook',
        },
      ],
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
  valid: [
    dedent`
      test.describe("foo", () => {
        test.beforeEach(() => {})
        test("bar", () => {
          someFn();
        })
      })
    `,
    dedent`
      test.beforeEach(() => {})
      test("bar", () => {
        someFn();
      })
    `,
    dedent`
      test.describe("foo", () => {
        test.beforeAll(() => {}),
        test.beforeEach(() => {})
        test.afterEach(() => {})
        test.afterAll(() => {})

        test("bar", () => {
          someFn();
        })
      })
    `,
    {
      code: dedent`
        it.describe("foo", () => {
          it.beforeEach(() => {})
          it("bar", () => {
            someFn();
          })
        })
      `,
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
})

runRuleTester('multiple describe blocks', rule, {
  invalid: [
    {
      code: dedent`
        describe.skip("foo", () => {
          test.beforeEach(() => {}),
          test.beforeAll(() => {}),
          test("bar", () => {
            someFn();
          })
        })
        test.describe("foo", () => {
          test.beforeEach(() => {}),
          test.beforeEach(() => {}),
          test.beforeAll(() => {}),
          test("bar", () => {
            someFn();
          })
        })
      `,
      errors: [
        {
          column: 3,
          data: { hook: 'beforeEach' },
          line: 10,
          messageId: 'noDuplicateHook',
        },
      ],
    },
  ],
  valid: [
    dedent`
      describe.skip("foo", () => {
        test.beforeEach(() => {}),
        test.beforeAll(() => {}),
        test("bar", () => {
          someFn();
        })
      })
      test.describe("foo", () => {
        test.beforeEach(() => {}),
        test.beforeAll(() => {}),
        test("bar", () => {
          someFn();
        })
      })
    `,
  ],
})

runRuleTester('nested describe blocks', rule, {
  invalid: [
    {
      code: dedent`
        test.describe("foo", () => {
          test.beforeAll(() => {}),
          test("bar", () => {
            someFn();
          })
          test.describe("inner_foo", () => {
            test.beforeEach(() => {})
            test.beforeEach(() => {})
            test("inner bar", () => {
              someFn();
            })
          })
        })
      `,
      errors: [
        {
          column: 5,
          data: { hook: 'beforeEach' },
          line: 8,
          messageId: 'noDuplicateHook',
        },
      ],
    },
  ],
  valid: [
    dedent`
      test.describe("foo", () => {
        test.beforeEach(() => {}),
        test("bar", () => {
          someFn();
        })
        test.describe("inner_foo", () => {
          test.beforeEach(() => {})
          test("inner bar", () => {
            someFn();
          })
        })
      })
    `,
  ],
})
