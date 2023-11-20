import dedent from 'dedent';
import rule from '../../src/rules/valid-title';
import { runRuleTester } from '../utils/rule-tester';

runRuleTester('valid-title', rule, {
  invalid: [
    {
      code: 'test("the correct way to properly handle all things", () => {});',
      errors: [
        {
          column: 6,
          data: { word: 'correct' },
          line: 1,
          messageId: 'disallowedWord',
        },
      ],
      options: [{ disallowedWords: ['correct', 'properly', 'all'] }],
    },
    {
      code: 'test.describe("the correct way to do things", function () {})',
      errors: [
        {
          column: 15,
          data: { word: 'correct' },
          line: 1,
          messageId: 'disallowedWord',
        },
      ],
      options: [{ disallowedWords: ['correct'] }],
    },
    {
      code: 'test("has ALL the things", () => {})',
      errors: [
        {
          column: 6,
          data: { word: 'ALL' },
          line: 1,
          messageId: 'disallowedWord',
        },
      ],
      options: [{ disallowedWords: ['all'] }],
    },
    {
      code: "test.describe('Very Descriptive Title Goes Here', function () {})",
      errors: [
        {
          column: 15,
          data: { word: 'Descriptive' },
          line: 1,
          messageId: 'disallowedWord',
        },
      ],
      options: [{ disallowedWords: ['descriptive'] }],
    },
    {
      code: 'test(`that the value is set properly`, function () {})',
      errors: [
        {
          column: 6,
          data: { word: 'properly' },
          line: 1,
          messageId: 'disallowedWord',
        },
      ],
      options: [{ disallowedWords: ['properly'] }],
    },
  ],
  valid: [
    'test.describe("the correct way to properly handle all the things", () => {});',
    'test("that all is as it should be", () => {});',
    {
      code: 'test("correctly sets the value", () => {});',
      options: [
        { disallowedWords: ['correct'], ignoreTypeOfDescribeName: false },
      ],
    },
    {
      code: 'test("correctly sets the value", () => {});',
      options: [{ disallowedWords: undefined }],
    },
  ],
});

runRuleTester('mustMatch & mustNotMatch options', rule, {
  invalid: [
    {
      code: dedent`
        test.describe('things to test', () => {
          test.describe('unit tests #unit', () => {
            test('is true', () => {
              expect(true).toBe(true);
            });
          });

          test.describe('e2e tests #e4e', () => {
            test('is another test #e2e #playwright4life', () => {});
          });
        });
      `,
      errors: [
        {
          column: 17,
          data: {
            functionName: 'describe',
            pattern: /(?:#(?!unit|e2e))\w+/u,
          },
          line: 8,
          messageId: 'mustNotMatch',
        },
        {
          column: 10,
          data: {
            functionName: 'test',
            pattern: /(?:#(?!unit|e2e))\w+/u,
          },
          line: 9,
          messageId: 'mustNotMatch',
        },
      ],
      options: [
        {
          mustMatch: /^[^#]+$|(?:#(?:unit|e2e))/u.source,
          mustNotMatch: /(?:#(?!unit|e2e))\w+/u.source,
        },
      ],
    },
    {
      code: dedent`
        test.describe('things to test', () => {
          test.describe('unit tests #unit', () => {
            test('is true', () => {
              expect(true).toBe(true);
            });
          });

          test.describe('e2e tests #e4e', () => {
            test('is another test #e2e #playwright4life', () => {});
          });
        });
      `,
      errors: [
        {
          column: 17,
          data: {
            functionName: 'describe',
            message: 'Please include "#unit" or "#e2e" in titles',
            pattern: /(?:#(?!unit|e2e))\w+/u,
          },
          line: 8,
          messageId: 'mustNotMatchCustom',
        },
        {
          column: 10,
          data: {
            functionName: 'test',
            message: 'Please include "#unit" or "#e2e" in titles',
            pattern: /(?:#(?!unit|e2e))\w+/u,
          },
          line: 9,
          messageId: 'mustNotMatchCustom',
        },
      ],
      options: [
        {
          mustMatch: [
            /^[^#]+$|(?:#(?:unit|e2e))/u.source,
            'Please include "#unit" or "#e2e" in titles',
          ],
          mustNotMatch: [
            /(?:#(?!unit|e2e))\w+/u.source,
            'Please include "#unit" or "#e2e" in titles',
          ],
        },
      ],
    },
    {
      code: dedent`
        test.describe('things to test', () => {
          test.describe('unit tests #unit', () => {
            test('is true', () => {
              expect(true).toBe(true);
            });
          });

          test.describe('e2e tests #e4e', () => {
            test('is another test #e2e #playwright4life', () => {});
          });
        });
      `,
      errors: [
        {
          column: 17,
          data: {
            functionName: 'describe',
            pattern: /(?:#(?!unit|e2e))\w+/u,
          },
          line: 8,
          messageId: 'mustNotMatch',
        },
      ],
      options: [
        {
          mustMatch: { describe: /^[^#]+$|(?:#(?:unit|e2e))/u.source },
          mustNotMatch: { describe: [/(?:#(?!unit|e2e))\w+/u.source] },
        },
      ],
    },
    {
      code: dedent`
        test.describe('things to test', () => {
          test.describe('unit tests #unit', () => {
            test('is true', () => {
              expect(true).toBe(true);
            });
          });

          test.describe('e2e tests #e4e', () => {
            test('is another test #e2e #playwright4life', () => {});
          });
        });
      `,
      errors: [
        {
          column: 17,
          data: {
            functionName: 'describe',
            message: 'Please include "#unit" or "#e2e" in describe titles',
            pattern: /(?:#(?!unit|e2e))\w+/u,
          },
          line: 8,
          messageId: 'mustNotMatchCustom',
        },
      ],
      options: [
        {
          mustMatch: { describe: /^[^#]+$|(?:#(?:unit|e2e))/u.source },
          mustNotMatch: {
            describe: [
              /(?:#(?!unit|e2e))\w+/u.source,
              'Please include "#unit" or "#e2e" in describe titles',
            ],
          },
        },
      ],
    },
    {
      code: dedent`
        test.describe('things to test', () => {
          test.describe('unit tests #unit', () => {
            test('is true', () => {
              expect(true).toBe(true);
            });
          });

          test.describe('e2e tests #e4e', () => {
            test('is another test #e2e #playwright4life', () => {});
          });
        });
      `,
      errors: [
        {
          column: 17,
          data: {
            functionName: 'describe',
            pattern: /(?:#(?!unit|e2e))\w+/u,
          },
          line: 8,
          messageId: 'mustNotMatch',
        },
      ],
      options: [
        {
          mustMatch: { test: /^[^#]+$|(?:#(?:unit|e2e))/u.source },
          mustNotMatch: { describe: /(?:#(?!unit|e2e))\w+/u.source },
        },
      ],
    },
    {
      code: dedent`
        test.describe('things to test', () => {
          test.describe('unit tests #unit', () => {
            test('is true #playwright4life', () => {
              expect(true).toBe(true);
            });
          });

          test.describe('e2e tests #e4e', () => {
            test('is another test #e2e #playwright4life', () => {});
          });
        });
      `,
      errors: [
        {
          column: 10,
          data: {
            functionName: 'test',
            message: 'Please include "#unit" or "#e2e" in it titles',
            pattern: /^[^#]+$|(?:#(?:unit|e2e))/u,
          },
          line: 3,
          messageId: 'mustMatchCustom',
        },
        {
          column: 17,
          data: {
            functionName: 'describe',
            message: 'Please include "#unit" or "#e2e" in describe titles',
            pattern: /(?:#(?!unit|e2e))\w+/u,
          },
          line: 8,
          messageId: 'mustNotMatchCustom',
        },
      ],
      options: [
        {
          mustMatch: {
            test: [
              /^[^#]+$|(?:#(?:unit|e2e))/u.source,
              'Please include "#unit" or "#e2e" in it titles',
            ],
          },
          mustNotMatch: {
            describe: [
              /(?:#(?!unit|e2e))\w+/u.source,
              'Please include "#unit" or "#e2e" in describe titles',
            ],
          },
        },
      ],
    },
    {
      code: 'test("the correct way to properly handle all things", () => {});',
      errors: [
        {
          column: 6,
          data: {
            functionName: 'test',
            pattern: /#(?:unit|integration|e2e)/u,
          },
          line: 1,
          messageId: 'mustMatch',
        },
      ],
      options: [{ mustMatch: /#(?:unit|integration|e2e)/u.source }],
    },
    {
      code: 'test.describe("the test", () => {});',
      errors: [
        {
          column: 15,
          data: {
            functionName: 'describe',
            pattern: /#(?:unit|integration|e2e)/u,
          },
          line: 1,
          messageId: 'mustMatch',
        },
      ],
      options: [
        { mustMatch: { describe: /#(?:unit|integration|e2e)/u.source } },
      ],
    },
    {
      code: 'test.describe.skip("the test", () => {});',
      errors: [
        {
          column: 20,
          data: {
            functionName: 'describe',
            pattern: /#(?:unit|integration|e2e)/u,
          },
          line: 1,
          messageId: 'mustMatch',
        },
      ],
      options: [
        { mustMatch: { describe: /#(?:unit|integration|e2e)/u.source } },
      ],
    },
  ],
  valid: [
    'test.describe("the correct way to properly handle all the things", () => {});',
    'test("that all is as it should be", () => {});',
    {
      code: 'test("correctly sets the value", () => {});',
      options: [{ mustMatch: {} }],
    },
    {
      code: 'test("correctly sets the value", () => {});',
      options: [{ mustMatch: / /u.source }],
    },
    {
      code: 'test("correctly sets the value", () => {});',
      options: [{ mustMatch: [/ /u.source] }],
    },
    {
      code: 'test("correctly sets the value #unit", () => {});',
      options: [{ mustMatch: /#(?:unit|integration|e2e)/u.source }],
    },
    {
      code: 'test("correctly sets the value", () => {});',
      options: [{ mustMatch: /^[^#]+$|(?:#(?:unit|e2e))/u.source }],
    },
    {
      code: 'test("correctly sets the value", () => {});',
      options: [
        { mustMatch: { describe: /#(?:unit|integration|e2e)/u.source } },
      ],
    },
    {
      code: dedent`
        test.describe('things to test', () => {
          test.describe('unit tests #unit', () => {
            test('is true #unit', () => {
              expect(true).toBe(true);
            });
          });

          test.describe('e2e tests #e2e', () => {
            test('is another test #e2e', () => {});
          });
        });
      `,
      options: [{ mustMatch: { test: /^[^#]+$|(?:#(?:unit|e2e))/u.source } }],
    },
  ],
});

runRuleTester('title-must-be-string', rule, {
  invalid: [
    {
      code: 'test(String(/.+/), () => {});',
      errors: [
        {
          column: 6,
          line: 1,
          messageId: 'titleMustBeString',
        },
      ],
      options: [{ ignoreTypeOfTestName: false }],
    },
    {
      code: 'const foo = "my-title"; test(foo, () => {});',
      errors: [
        {
          column: 30,
          line: 1,
          messageId: 'titleMustBeString',
        },
      ],
      options: [{ ignoreTypeOfTestName: false }],
    },
    {
      code: 'test(123, () => {});',
      errors: [
        {
          column: 6,
          line: 1,
          messageId: 'titleMustBeString',
        },
      ],
    },
    {
      code: 'test.only(123, () => {});',
      errors: [
        {
          column: 11,
          line: 1,
          messageId: 'titleMustBeString',
        },
      ],
    },
    {
      code: 'test(1 + 2 + 3, () => {});',
      errors: [
        {
          column: 6,
          line: 1,
          messageId: 'titleMustBeString',
        },
      ],
    },
    {
      code: 'test.only(1 + 2 + 3, () => {});',
      errors: [
        {
          column: 11,
          line: 1,
          messageId: 'titleMustBeString',
        },
      ],
    },
    {
      code: 'test.skip(123, () => {});',
      errors: [
        {
          column: 11,
          line: 1,
          messageId: 'titleMustBeString',
        },
      ],
      options: [{ ignoreTypeOfDescribeName: true }],
    },
    {
      code: 'test.describe(String(/.+/), () => {});',
      errors: [
        {
          column: 15,
          line: 1,
          messageId: 'titleMustBeString',
        },
      ],
    },
    {
      code: 'test.describe(myFunction, () => 1);',
      errors: [
        {
          column: 15,
          line: 1,
          messageId: 'titleMustBeString',
        },
      ],
      options: [{ ignoreTypeOfDescribeName: false }],
    },
    {
      code: 'test.describe(myFunction, () => {});',
      errors: [
        {
          column: 15,
          line: 1,
          messageId: 'titleMustBeString',
        },
      ],
    },
    {
      code: 'test.describe(6, function () {})',
      errors: [
        {
          column: 15,
          line: 1,
          messageId: 'titleMustBeString',
        },
      ],
    },
    {
      code: 'test.describe.skip(123, () => {});',
      errors: [
        {
          column: 20,
          line: 1,
          messageId: 'titleMustBeString',
        },
      ],
    },
  ],
  valid: [
    'test("is a string", () => {});',
    'test("is" + " a " + " string", () => {});',
    'test(1 + " + " + 1, () => {});',
    'test("is a string", () => {});',
    'test(`${myFunc} is a string`, () => {});',
    'test.describe("is a string", () => {});',
    'test.describe.skip("is a string", () => {});',
    'test.describe.skip(`${myFunc} is a string`, () => {});',
    'test.describe("is a string", () => {});',
    {
      code: 'test.describe(String(/.+/), () => {});',
      options: [{ ignoreTypeOfDescribeName: true }],
    },
    {
      code: 'test(String(/.+/), () => {});',
      options: [{ ignoreTypeOfTestName: true }],
    },
    {
      code: 'const foo = "my-title"; test(foo, () => {});',
      options: [{ ignoreTypeOfTestName: true }],
    },
    {
      code: 'test.describe(myFunction, () => {});',
      options: [{ ignoreTypeOfDescribeName: true }],
    },
    {
      code: 'test.describe(skipFunction, () => {});',
      options: [{ disallowedWords: [], ignoreTypeOfDescribeName: true }],
    },
  ],
});

runRuleTester('no-empty-title', rule, {
  invalid: [
    {
      code: 'test.describe("", function () {})',
      errors: [
        {
          column: 1,
          data: { functionName: 'describe' },
          line: 1,
          messageId: 'emptyTitle',
        },
      ],
    },
    {
      code: dedent`
        test.describe('foo', () => {
          test('', () => {});
        });
      `,
      errors: [
        {
          column: 3,
          data: { functionName: 'test' },
          line: 2,
          messageId: 'emptyTitle',
        },
      ],
    },
    {
      code: 'test("", function () {})',
      errors: [
        {
          column: 1,
          data: { functionName: 'test' },
          line: 1,
          messageId: 'emptyTitle',
        },
      ],
    },
    {
      code: 'test.only("", function () {})',
      errors: [
        {
          column: 1,
          data: { functionName: 'test' },
          line: 1,
          messageId: 'emptyTitle',
        },
      ],
    },
    {
      code: 'test("", function () {})',
      errors: [
        {
          column: 1,
          data: { functionName: 'test' },
          line: 1,
          messageId: 'emptyTitle',
        },
      ],
    },
    {
      code: 'test.only("", function () {})',
      errors: [
        {
          column: 1,
          data: { functionName: 'test' },
          line: 1,
          messageId: 'emptyTitle',
        },
      ],
    },
    {
      code: 'test(``, function () {})',
      errors: [
        {
          column: 1,
          data: { functionName: 'test' },
          line: 1,
          messageId: 'emptyTitle',
        },
      ],
    },
    {
      code: 'test.only(``, function () {})',
      errors: [
        {
          column: 1,
          data: { functionName: 'test' },
          line: 1,
          messageId: 'emptyTitle',
        },
      ],
    },
  ],
  valid: [
    'test.describe()',
    'someFn("", function () {})',
    'test.describe("foo", function () {})',
    'test.describe("foo", function () { test("bar", function () {}) })',
    'test("foo", function () {})',
    'test.only("foo", function () {})',
    'test(`foo`, function () {})',
    'test.skip(`foo`, function () {})',
    'test(`${foo}`, function () {})',
    'test.fixme(`${foo}`, function () {})',
  ],
});

runRuleTester('no-accidental-space', rule, {
  invalid: [
    {
      code: 'test.describe(" foo", function () {})',
      errors: [{ column: 15, line: 1, messageId: 'accidentalSpace' }],
      output: 'test.describe("foo", function () {})',
    },
    {
      code: 'test.describe(" foo foe fum", function () {})',
      errors: [{ column: 15, line: 1, messageId: 'accidentalSpace' }],
      output: 'test.describe("foo foe fum", function () {})',
    },
    {
      code: 'test.describe("foo foe fum ", function () {})',
      errors: [{ column: 15, line: 1, messageId: 'accidentalSpace' }],
      output: 'test.describe("foo foe fum", function () {})',
    },
    {
      code: 'test.describe(" foo", function () {})',
      errors: [{ column: 15, line: 1, messageId: 'accidentalSpace' }],
      output: 'test.describe("foo", function () {})',
    },
    {
      code: "test.describe(' foo', function () {})",
      errors: [{ column: 15, line: 1, messageId: 'accidentalSpace' }],
      output: "test.describe('foo', function () {})",
    },
    {
      code: 'test.describe(" foo", function () {})',
      errors: [{ column: 15, line: 1, messageId: 'accidentalSpace' }],
      output: 'test.describe("foo", function () {})',
    },
    {
      code: 'test(" foo", function () {})',
      errors: [{ column: 6, line: 1, messageId: 'accidentalSpace' }],
      output: 'test("foo", function () {})',
    },
    {
      code: 'test.only(" foo", function () {})',
      errors: [{ column: 11, line: 1, messageId: 'accidentalSpace' }],
      output: 'test.only("foo", function () {})',
    },
    {
      code: 'test(" foo", function () {})',
      errors: [{ column: 6, line: 1, messageId: 'accidentalSpace' }],
      output: 'test("foo", function () {})',
    },
    {
      code: 'test.skip(" foo", function () {})',
      errors: [{ column: 11, line: 1, messageId: 'accidentalSpace' }],
      output: 'test.skip("foo", function () {})',
    },
    {
      code: 'test("foo ", function () {})',
      errors: [{ column: 6, line: 1, messageId: 'accidentalSpace' }],
      output: 'test("foo", function () {})',
    },
    {
      code: 'test.skip("foo ", function () {})',
      errors: [{ column: 11, line: 1, messageId: 'accidentalSpace' }],
      output: 'test.skip("foo", function () {})',
    },
    {
      code: 'test(" foo", function () {})',
      errors: [{ column: 6, line: 1, messageId: 'accidentalSpace' }],
      output: 'test("foo", function () {})',
    },
    {
      code: 'test(" foo", function () {})',
      errors: [{ column: 6, line: 1, messageId: 'accidentalSpace' }],
      output: 'test("foo", function () {})',
    },
    {
      code: 'test.only(" foo", function () {})',
      errors: [{ column: 11, line: 1, messageId: 'accidentalSpace' }],
      output: 'test.only("foo", function () {})',
    },
    {
      code: 'test(` foo`, function () {})',
      errors: [{ column: 6, line: 1, messageId: 'accidentalSpace' }],
      output: 'test(`foo`, function () {})',
    },
    {
      code: 'test.only(` foo`, function () {})',
      errors: [{ column: 11, line: 1, messageId: 'accidentalSpace' }],
      output: 'test.only(`foo`, function () {})',
    },
    {
      code: 'test(` foo bar bang`, function () {})',
      errors: [{ column: 6, line: 1, messageId: 'accidentalSpace' }],
      output: 'test(`foo bar bang`, function () {})',
    },
    {
      code: 'test.only(` foo bar bang`, function () {})',
      errors: [{ column: 11, line: 1, messageId: 'accidentalSpace' }],
      output: 'test.only(`foo bar bang`, function () {})',
    },
    {
      code: 'test(` foo bar bang  `, function () {})',
      errors: [{ column: 6, line: 1, messageId: 'accidentalSpace' }],
      output: 'test(`foo bar bang`, function () {})',
    },
    {
      code: 'test.only(` foo bar bang  `, function () {})',
      errors: [{ column: 11, line: 1, messageId: 'accidentalSpace' }],
      output: 'test.only(`foo bar bang`, function () {})',
    },
    {
      code: 'test(" foo", function () {})',
      errors: [{ column: 6, line: 1, messageId: 'accidentalSpace' }],
      output: 'test("foo", function () {})',
    },
    {
      code: 'test(" foo  ", function () {})',
      errors: [{ column: 6, line: 1, messageId: 'accidentalSpace' }],
      output: 'test("foo", function () {})',
    },
    {
      code: dedent`
        test.describe(' foo', () => {
          test('bar', () => {})
        })
      `,
      errors: [{ column: 15, line: 1, messageId: 'accidentalSpace' }],
      output: dedent`
        test.describe('foo', () => {
          test('bar', () => {})
        })
      `,
    },
    {
      code: dedent`
        test.describe('foo', () => {
          test(' bar', () => {})
        })
      `,
      errors: [{ column: 8, line: 2, messageId: 'accidentalSpace' }],
      output: dedent`
        test.describe('foo', () => {
          test('bar', () => {})
        })
      `,
    },
  ],
  valid: [
    'someFn("foo", function () {})',
    'test()',
    'test("foo", function () {})',
    'test.describe()',
    'test.describe("foo", function () {})',
    'test.only()',
    'test.only("foo", function () {})',
    dedent`
      test.describe('foo', () => {
        test('bar', () => {})
      })
    `,
    {
      code: 'test(`GIVEN... \n  `, () => {});',
      options: [{ ignoreSpaces: true }],
    },
  ],
});

runRuleTester('no-duplicate-prefix describe', rule, {
  invalid: [
    {
      code: 'test.describe("describe foo", function () {})',
      errors: [{ column: 15, line: 1, messageId: 'duplicatePrefix' }],
      output: 'test.describe("foo", function () {})',
    },
    {
      code: 'test.describe("describe foo", function () {})',
      errors: [{ column: 15, line: 1, messageId: 'duplicatePrefix' }],
      output: 'test.describe("foo", function () {})',
    },
    {
      code: 'test.describe("describe foo", function () {})',
      errors: [{ column: 15, line: 1, messageId: 'duplicatePrefix' }],
      output: 'test.describe("foo", function () {})',
    },
    {
      code: "test.describe('describe foo', function () {})",
      errors: [{ column: 15, line: 1, messageId: 'duplicatePrefix' }],
      output: "test.describe('foo', function () {})",
    },
    {
      code: 'test.describe(`describe foo`, function () {})',
      errors: [{ column: 15, line: 1, messageId: 'duplicatePrefix' }],
      output: 'test.describe(`foo`, function () {})',
    },
  ],
  valid: ['test.describe("foo", function () {})'],
});

runRuleTester('no-duplicate-prefix test', rule, {
  invalid: [
    {
      code: 'test("test foo", function () {})',
      errors: [{ column: 6, line: 1, messageId: 'duplicatePrefix' }],
      output: 'test("foo", function () {})',
    },
    {
      code: 'test(`test foo`, function () {})',
      errors: [{ column: 6, line: 1, messageId: 'duplicatePrefix' }],
      output: 'test(`foo`, function () {})',
    },
    {
      code: 'test(`test foo test`, function () {})',
      errors: [{ column: 6, line: 1, messageId: 'duplicatePrefix' }],
      output: 'test(`foo test`, function () {})',
    },
  ],
  valid: [
    'test("foo", function () {})',
    "test('foo', function () {})",
    'test(`foo`, function () {})',
    'test("foo test", function () {})',
  ],
});

runRuleTester('no-duplicate-prefix nested', rule, {
  invalid: [
    {
      code: dedent`
        test.describe('describe foo', () => {
          test('bar', () => {})
        })
      `,
      errors: [{ column: 15, line: 1, messageId: 'duplicatePrefix' }],
      output: dedent`
        test.describe('foo', () => {
          test('bar', () => {})
        })
      `,
    },
    {
      code: dedent`
        test.describe('describe foo', () => {
          test('describes things correctly', () => {})
        })
      `,
      errors: [{ column: 15, line: 1, messageId: 'duplicatePrefix' }],
      output: dedent`
        test.describe('foo', () => {
          test('describes things correctly', () => {})
        })
      `,
    },
    {
      code: dedent`
        test.describe('foo', () => {
          test('test bar', () => {})
        })
      `,
      errors: [{ column: 8, line: 2, messageId: 'duplicatePrefix' }],
      output: dedent`
        test.describe('foo', () => {
          test('bar', () => {})
        })
      `,
    },
  ],
  valid: [
    dedent`
      test.describe('foo', () => {
        test('bar', () => {})
      })
    `,
    dedent`
      test.describe('foo', () => {
        test('describes things correctly', () => {})
      })
    `,
  ],
});
