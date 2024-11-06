import rule from '../../src/rules/no-commented-out-tests.js'
import { javascript, runRuleTester } from '../utils/rule-tester.js'

const messageId = 'commentedTests'

runRuleTester('no-commented-out-tests', rule, {
  invalid: [
    {
      code: '// test.describe("foo", function () {})',
      errors: [{ column: 1, line: 1, messageId }],
    },
    {
      code: '// describe["skip"]("foo", function () {})',
      errors: [{ column: 1, line: 1, messageId }],
    },
    {
      code: '// describe[\'skip\']("foo", function () {})',
      errors: [{ column: 1, line: 1, messageId }],
    },
    {
      code: '// test("foo", function () {})',
      errors: [{ column: 1, line: 1, messageId }],
    },
    {
      code: '// test.only("foo", function () {})',
      errors: [{ column: 1, line: 1, messageId }],
    },
    {
      code: '// test["skip"]("foo", function () {})',
      errors: [{ column: 1, line: 1, messageId }],
    },
    {
      code: '// test.skip("foo", function () {})',
      errors: [{ column: 1, line: 1, messageId }],
    },
    {
      code: javascript`
        // test(
        //   "foo", function () {}
        // )
      `,
      errors: [{ column: 1, line: 1, messageId }],
    },
    {
      code: javascript`
        /* test
          (
            "foo", function () {}
          )
        */
      `,
      errors: [{ column: 1, line: 1, messageId }],
    },
    {
      code: '// test("has title but no callback")',
      errors: [{ column: 1, line: 1, messageId }],
    },
    {
      code: '// test()',
      errors: [{ column: 1, line: 1, messageId }],
    },
    {
      code: '// test.someNewMethodThatMightBeAddedInTheFuture()',
      errors: [{ column: 1, line: 1, messageId }],
    },
    {
      code: '// test["someNewMethodThatMightBeAddedInTheFuture"]()',
      errors: [{ column: 1, line: 1, messageId }],
    },
    {
      code: javascript`
        foo()
        /*
          test.describe("has title but no callback", () => {})
        */
        bar()
      `,
      errors: [{ column: 1, line: 2, messageId }],
    },
    // Global aliases
    {
      code: '// it("foo", () => {});',
      errors: [{ column: 1, line: 1, messageId }],
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
  valid: [
    '// foo("bar", function () {})',
    'test.describe("foo", function () {})',
    'test("foo", function () {})',
    'test.describe.only("foo", function () {})',
    'test.only("foo", function () {})',
    'test.skip("foo", function () {})',
    'test.concurrent("foo", function () {})',
    'var appliedSkip = describe.skip; appliedSkip.apply(describe)',
    'var calledSkip = test.skip; calledSkip.call(it)',
    '({ f: function () {} }).f()',
    '(a || b).f()',
    'testHappensToStartWithTest()',
    'testSomething()',
    '// latest(dates)',
    '// TODO: unify with Git implementation from Shipit (?)',
    '#!/usr/bin/env node',
    javascript`
      import { pending } from "actions"

      test("foo", () => {
        expect(pending()).toEqual({})
      })
    `,
    javascript`
      const { pending } = require("actions")

      test("foo", () => {
        expect(pending()).toEqual({})
      })
    `,
    javascript`
      test("foo", () => {
        const pending = getPending()
        expect(pending()).toEqual({})
      })
    `,
    javascript`
      test("foo", () => {
        expect(pending()).toEqual({})
      })

      function pending() {
        return {}
      }
    `,
    // Global aliases
    {
      code: 'it("foo", () => {});',
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
})
